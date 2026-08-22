import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { AdminDataError } from './products.js';
import { writeAudit } from './audit.js';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'public', 'images', 'uploads');
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const entities = {
  product: { table: 'products', folder: 'products', events: 'product' },
  category: { table: 'categories', folder: 'categories', events: 'category' },
};

function detectImage(buffer) {
  if (buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { mime:'image/png', ext:'png', width:buffer.readUInt32BE(16), height:buffer.readUInt32BE(20) };
  if (buffer.length >= 12 && buffer.subarray(0, 3).equals(Buffer.from([255,216,255]))) {
    let offset=2;
    while(offset+9<buffer.length){if(buffer[offset]!==255){offset++;continue;}const marker=buffer[offset+1],length=buffer.readUInt16BE(offset+2);if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))return{mime:'image/jpeg',ext:'jpg',height:buffer.readUInt16BE(offset+5),width:buffer.readUInt16BE(offset+7)};offset+=2+length;}
    throw new AdminDataError('INVALID_IMAGE','JPEG sin dimensiones válidas.',400);
  }
  if (buffer.length >= 30 && buffer.toString('ascii',0,4)==='RIFF' && buffer.toString('ascii',8,12)==='WEBP') {
    let width=null,height=null;if(buffer.toString('ascii',12,16)==='VP8X'){width=1+buffer.readUIntLE(24,3);height=1+buffer.readUIntLE(27,3);}return{mime:'image/webp',ext:'webp',width,height};
  }
  throw new AdminDataError('INVALID_IMAGE','El contenido no es JPEG, PNG o WebP válido.',400);
}

function safeDelete(publicPath) {
  if (!publicPath?.startsWith('/images/uploads/')) return;
  const absolute=path.resolve(process.cwd(),'public',publicPath.slice(1));
  if(absolute.startsWith(UPLOAD_ROOT+path.sep)&&existsSync(absolute))unlinkSync(absolute);
}

export class AdminOperations {
  constructor(db, auth){this.db=db;this.auth=auth;}
  entity(type,id){const cfg=entities[type];if(!cfg)throw new AdminDataError('INVALID_ENTITY','Entidad inválida.',400);const row=this.db.prepare(`SELECT * FROM ${cfg.table} WHERE id=?`).get(id);if(!row)throw new AdminDataError('ENTITY_NOT_FOUND','Entidad no encontrada.',404);return{cfg,row};}
  upload(type,id,input,userId){this.auth.requireProfile(userId,{write:true});const{cfg,row}=this.entity(type,id);if(!input||Object.keys(input).some(k=>!['filename','mimeType','data','imageAlt'].includes(k)))throw new AdminDataError('VALIDATION_ERROR','Upload inválido.',400);const filename=String(input.filename??'');if(!/^[^\\/]{1,120}\.(jpe?g|png|webp)$/i.test(filename))throw new AdminDataError('INVALID_EXTENSION','Extensión no permitida.',400);const alt=String(input.imageAlt??'').trim();if(alt.length<5||alt.length>180)throw new AdminDataError('VALIDATION_ERROR','Texto alternativo inválido.',400,{imageAlt:'Debe tener entre 5 y 180 caracteres.'});let buffer;try{buffer=Buffer.from(String(input.data??''),'base64')}catch{throw new AdminDataError('INVALID_IMAGE','Datos de imagen inválidos.',400)}if(!buffer.length||buffer.length>MAX_IMAGE_BYTES)throw new AdminDataError('IMAGE_SIZE','La imagen debe pesar como máximo 5 MB.',400);const detected=detectImage(buffer);if(input.mimeType!==detected.mime)throw new AdminDataError('MIME_MISMATCH','El MIME declarado no coincide con el archivo.',400);if((detected.width&&detected.width>12000)||(detected.height&&detected.height>12000))throw new AdminDataError('IMAGE_DIMENSIONS','Dimensiones excesivas.',400);const dir=path.join(UPLOAD_ROOT,cfg.folder,id);mkdirSync(dir,{recursive:true});const name=`${randomUUID()}.${detected.ext}`,absolute=path.join(dir,name),publicPath=`/images/uploads/${cfg.folder}/${id}/${name}`;writeFileSync(absolute,buffer,{flag:'wx'});try{this.db.transaction(()=>{this.db.prepare(`UPDATE ${cfg.table} SET image_path=?,image_alt=?,updated_by=?,updated_at=?${type==='product'?',version=version+1':''} WHERE id=?`).run(publicPath,alt,userId,new Date().toISOString(),id);writeAudit(this.db,{userId,action:`${cfg.events}.image_${row.image_path?'replaced':'added'}`,entityType:type,entityId:id,metadata:{old_path:row.image_path,new_path:publicPath}})})();}catch(e){safeDelete(publicPath);throw e;}safeDelete(row.image_path);return{imagePath:publicPath,imageAlt:alt};}
  removeImage(type,id,userId){this.auth.requireProfile(userId,{write:true});const{cfg,row}=this.entity(type,id);this.db.transaction(()=>{this.db.prepare(`UPDATE ${cfg.table} SET image_path=NULL,image_alt=${type==='category'?'NULL':'image_alt'},updated_by=?,updated_at=?${type==='product'?',version=version+1':''} WHERE id=?`).run(userId,new Date().toISOString(),id);writeAudit(this.db,{userId,action:`${cfg.events}.image_removed`,entityType:type,entityId:id,metadata:{old_path:row.image_path,new_path:null}})})();safeDelete(row.image_path);return{imagePath:null};}
  reorder(type,ids,userId){this.auth.requireProfile(userId,{write:true});const{cfg}=this.entity(type,ids?.[0]);const current=this.db.prepare(`SELECT id,display_order FROM ${cfg.table} ORDER BY display_order,id`).all();if(!Array.isArray(ids)||ids.length!==current.length||new Set(ids).size!==ids.length||ids.some(id=>!current.some(x=>x.id===id)))throw new AdminDataError('INVALID_ORDER','El orden debe contener todos los IDs una sola vez.',400);const before=current.map(x=>x.id);this.db.transaction(()=>{const update=this.db.prepare(`UPDATE ${cfg.table} SET display_order=?,updated_by=?,updated_at=?${type==='product'?',version=version+1':''} WHERE id=?`);ids.forEach((id,index)=>update.run(index,userId,new Date().toISOString(),id));writeAudit(this.db,{userId,action:`${cfg.events}.reordered`,entityType:type,entityId:null,metadata:{before,after:ids}})})();return ids.map((id,index)=>({id,displayOrder:index}));}
  deleteProduct(id,input,userId){this.auth.requireProfile(userId,{write:true});if(input?.reauth!=='DELETE DEV')throw new AdminDataError('DEV_REAUTH_REQUIRED','Confirmación DEV inválida.',403);const{row}=this.entity('product',id);if(row.status!=='archived')throw new AdminDataError('ARCHIVE_REQUIRED','Archiva el producto antes de eliminarlo.',409);const revisionMedia=this.db.prepare('SELECT changes FROM product_revisions WHERE product_id=?').all(id).flatMap(item=>{try{const path=JSON.parse(item.changes).imagePath;return path?[path]:[]}catch{return[]}});this.db.transaction(()=>{this.db.prepare('DELETE FROM product_revisions WHERE product_id=?').run(id);this.db.prepare('DELETE FROM products WHERE id=?').run(id);writeAudit(this.db,{userId,action:'product.deleted_permanently',entityType:'product',entityId:id,metadata:{snapshot:row}})})();safeDelete(row.image_path);revisionMedia.forEach(safeDelete);return{id};}
  history(type,userId,{entityId=null,search=''}={}){const profile=this.auth.requireProfile(userId);if(type==='user'&&profile.role==='editor')throw new AdminDataError('HISTORY_FORBIDDEN','Historial no permitido.',403);const entityType=type==='user'?'profile':type;let rows=this.db.prepare(`SELECT audit_log.*,profiles.display_name user_name,target.role target_role FROM audit_log LEFT JOIN profiles ON profiles.id=audit_log.user_id LEFT JOIN profiles target ON target.id=audit_log.entity_id WHERE entity_type=? AND (? IS NULL OR audit_log.entity_id=?) ORDER BY audit_log.id DESC`).all(entityType,entityId,entityId).map(r=>({...r,metadata:r.metadata?JSON.parse(r.metadata):null}));if(type==='user'&&profile.role==='admin')rows=rows.filter(r=>r.target_role==='editor'||r.metadata?.snapshot?.role==='editor');const q=String(search).trim().toLowerCase();if(q)rows=rows.filter(r=>`${r.action} ${r.user_name??''} ${JSON.stringify(r.metadata??{})}`.toLowerCase().includes(q));return rows;}
  summary(type,id,userId){const rows=this.history(type,userId,{entityId:id});const relevant=rows.filter(r=>!r.action.endsWith('.created')&&r.action!=='user.invited');return{count:relevant.length,last:relevant[0]??null};}
}
