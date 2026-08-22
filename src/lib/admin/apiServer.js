import { createServer } from 'node:http';
import { initializeDatabase } from '../database.js';
import { ADMIN_PROFILE_HEADER } from '../../config/adminApi.js';
import { AdminDataError, AdminProductRepository } from './products.js';
import { AdminProductService } from './productService.js';
import { CategoryRepository, CategoryService } from './categories.js';
import { AdminOperations } from './operations.js';
import { UserService } from './users.js';
import { EditorialWorkflowService } from './editorial.js';

const DEFAULT_ALLOWED_ORIGINS = new Set(['http://localhost:4321', 'http://127.0.0.1:4321']);
const MAX_BODY_BYTES = 64 * 1024;

const sendJson = (response, status, payload, origin) => {
  const body = JSON.stringify(payload);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  response.writeHead(status, headers);
  response.end(body);
};

const ok = (response, data, origin, status = 200) => sendJson(response, status, { ok: true, data }, origin);
const fail = (response, status, code, message, origin, fields) => sendJson(response, status, { ok: false, error: { code, message, ...(fields ? { fields } : {}) } }, origin);

async function readJson(request, maxBytes = MAX_BODY_BYTES) {
  if (!String(request.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) {
    throw new AdminDataError('JSON_REQUIRED', 'La solicitud debe utilizar application/json.', 400);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new AdminDataError('BODY_TOO_LARGE', 'El cuerpo de la solicitud es demasiado grande.', 400);
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new AdminDataError('INVALID_JSON', 'El cuerpo JSON no es válido.', 400);
  }
}

export function createAdminApiServer({ databasePath, allowedOrigins = DEFAULT_ALLOWED_ORIGINS } = {}) {
  const db = initializeDatabase(databasePath);
  const service = new AdminProductService(new AdminProductRepository(db));
  const categoryService = new CategoryService(new CategoryRepository(db), service);
  const operations = new AdminOperations(db, service);
  const users = new UserService(db, service);
  const editorial = new EditorialWorkflowService(db, service);
  const allowed = allowedOrigins instanceof Set ? allowedOrigins : new Set(allowedOrigins);

  const server = createServer(async (request, response) => {
    const requestOrigin = request.headers.origin;
    const origin = requestOrigin && allowed.has(requestOrigin) ? requestOrigin : undefined;
    if (requestOrigin && !origin) return fail(response, 403, 'ORIGIN_FORBIDDEN', 'Origen local no permitido.');

    if (request.method === 'OPTIONS') {
      const headers = {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': `Content-Type, ${ADMIN_PROFILE_HEADER}`,
        'Access-Control-Max-Age': '600',
        'Vary': 'Origin',
      };
      if (origin) headers['Access-Control-Allow-Origin'] = origin;
      response.writeHead(204, headers);
      return response.end();
    }

    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const profileId = request.headers[ADMIN_PROFILE_HEADER];
    const productMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
    const actionMatch = url.pathname.match(/^\/api\/admin\/products\/([^/]+)\/(archive|restore)$/);
    const categoryMatch = url.pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
    const categoryAction = url.pathname.match(/^\/api\/admin\/categories\/([^/]+)\/(archive|restore|delete)$/);
    const mediaMatch=url.pathname.match(/^\/api\/admin\/(products|categories)\/([^/]+)\/image$/);
    const productDelete=url.pathname.match(/^\/api\/admin\/products\/([^/]+)\/delete$/);
    const userMatch=url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/),userAction=url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/(activate|deactivate|password-reset|delete)$/),inviteAction=url.pathname.match(/^\/api\/admin\/users\/([^/]+)\/invitation\/(cancel|recreate)$/);
    const revisionMatch=url.pathname.match(/^\/api\/admin\/revisions\/([^/]+)$/),revisionAction=url.pathname.match(/^\/api\/admin\/revisions\/([^/]+)\/(approve|reject|cancel)$/),productRevision=url.pathname.match(/^\/api\/admin\/products\/([^/]+)\/revisions$/);
    const revisionMedia=url.pathname.match(/^\/api\/admin\/revisions\/([^/]+)\/image$/);

    try {
      if (request.method === 'GET' && url.pathname === '/api/admin/products') return ok(response, service.list(profileId), origin);
      if (request.method === 'GET' && productMatch) return ok(response, service.get(decodeURIComponent(productMatch[1]), profileId), origin);
      if (request.method === 'GET' && url.pathname === '/api/admin/categories') return ok(response, categoryService.list(profileId), origin);
      if (request.method === 'GET' && categoryMatch) return ok(response, categoryService.get(decodeURIComponent(categoryMatch[1]), profileId), origin);
      if (request.method === 'GET' && url.pathname === '/api/admin/stats') return ok(response, service.stats(profileId), origin);
      if(request.method==='GET'&&url.pathname==='/api/admin/users')return ok(response,users.list(profileId,{search:url.searchParams.get('search')||''}),origin);
      if(request.method==='GET'&&userMatch)return ok(response,users.get(decodeURIComponent(userMatch[1]),profileId),origin);
      if(request.method==='GET'&&url.pathname==='/api/admin/revisions')return ok(response,editorial.list(profileId,{status:url.searchParams.get('status')??'pending',search:url.searchParams.get('search')||''}),origin);
      if(request.method==='GET'&&revisionMatch)return ok(response,editorial.get(decodeURIComponent(revisionMatch[1]),profileId),origin);
      if(request.method==='GET'&&url.pathname==='/api/admin/history')return ok(response,operations.history(url.searchParams.get('type')||'product',profileId,{entityId:url.searchParams.get('entityId'),search:url.searchParams.get('search')||''}),origin);
      if(request.method==='GET'&&url.pathname==='/api/admin/history/summary')return ok(response,operations.summary(url.searchParams.get('type')||'product',url.searchParams.get('entityId'),profileId),origin);
      if (request.method === 'POST' && url.pathname === '/api/admin/products') return ok(response, editorial.create(await readJson(request), profileId), origin, 201);
      if (request.method === 'POST' && url.pathname === '/api/admin/categories') return ok(response, categoryService.create(await readJson(request), profileId), origin, 201);
      if(request.method==='POST'&&url.pathname==='/api/admin/users/invite')return ok(response,users.invite(await readJson(request),profileId),origin,201);
      if(request.method==='PUT'&&userMatch)return ok(response,users.update(decodeURIComponent(userMatch[1]),await readJson(request),profileId),origin);
      if(request.method==='POST'&&inviteAction)return ok(response,users.invitation(decodeURIComponent(inviteAction[1]),inviteAction[2],profileId),origin);
      if(request.method==='POST'&&userAction){const id=decodeURIComponent(userAction[1]),action=userAction[2];if(action==='activate'||action==='deactivate')return ok(response,users.access(id,action==='activate',profileId),origin);if(action==='password-reset')return ok(response,users.passwordReset(id,profileId),origin);return ok(response,users.delete(id,await readJson(request),profileId),origin)}
      if(request.method==='POST'&&productRevision)return ok(response,editorial.submit(decodeURIComponent(productRevision[1]),await readJson(request),profileId),origin,201);
      if(request.method==='POST'&&revisionMedia)return ok(response,editorial.uploadMedia(decodeURIComponent(revisionMedia[1]),await readJson(request,7*1024*1024),profileId),origin);
      if(request.method==='DELETE'&&revisionMedia)return ok(response,editorial.removeMedia(decodeURIComponent(revisionMedia[1]),profileId),origin);
      if(request.method==='POST'&&revisionAction){const id=decodeURIComponent(revisionAction[1]),action=revisionAction[2],body=await readJson(request);return ok(response,action==='approve'?editorial.approve(id,body,profileId):editorial.resolve(id,action==='reject'?'rejected':'cancelled',body.comment,profileId),origin)}
      if(request.method==='PUT'&&url.pathname==='/api/admin/products/reorder')return ok(response,operations.reorder('product',(await readJson(request)).ids,profileId),origin);
      if(request.method==='PUT'&&url.pathname==='/api/admin/categories/reorder')return ok(response,operations.reorder('category',(await readJson(request)).ids,profileId),origin);
      if (request.method === 'PUT' && categoryMatch) return ok(response, categoryService.update(decodeURIComponent(categoryMatch[1]), await readJson(request), profileId), origin);
      if(request.method==='POST'&&mediaMatch){const type=mediaMatch[1]==='products'?'product':'category',id=decodeURIComponent(mediaMatch[2]),body=await readJson(request,7*1024*1024),profile=service.requireProfile(profileId);if(type==='product'&&profile.role==='editor'&&profile.publishing_mode==='direct_publish')return ok(response,editorial.directMedia(id,body,profileId),origin);return ok(response,operations.upload(type,id,body,profileId),origin)}
      if(request.method==='DELETE'&&mediaMatch){const type=mediaMatch[1]==='products'?'product':'category',id=decodeURIComponent(mediaMatch[2]),profile=service.requireProfile(profileId);if(type==='product'&&profile.role==='editor'&&profile.publishing_mode==='direct_publish')return ok(response,editorial.directRemoveMedia(id,profileId),origin);return ok(response,operations.removeImage(type,id,profileId),origin)}
      if(request.method==='POST'&&productDelete)return ok(response,operations.deleteProduct(decodeURIComponent(productDelete[1]),await readJson(request),profileId),origin);
      if (request.method === 'PUT' && productMatch) return ok(response, editorial.update(decodeURIComponent(productMatch[1]), await readJson(request), profileId), origin);
      if (request.method === 'POST' && actionMatch) {
        const id = decodeURIComponent(actionMatch[1]);
        return ok(response, actionMatch[2] === 'archive' ? service.archive(id, profileId) : service.restore(id, profileId), origin);
      }
      if (request.method === 'POST' && categoryAction) {
        const id=decodeURIComponent(categoryAction[1]),action=categoryAction[2];
        return ok(response,action==='archive'?categoryService.archive(id,profileId):action==='restore'?categoryService.restore(id,profileId):categoryService.delete(id,await readJson(request),profileId),origin);
      }
      const knownPath = url.pathname === '/api/admin/products' || url.pathname === '/api/admin/categories' || url.pathname === '/api/admin/stats' || productMatch || actionMatch || categoryMatch || categoryAction;
      if (knownPath) return fail(response, 405, 'METHOD_NOT_ALLOWED', 'Método HTTP no permitido para esta ruta.', origin);
      return fail(response, 404, 'ROUTE_NOT_FOUND', 'Ruta no encontrada.', origin);
    } catch (error) {
      if (error instanceof AdminDataError) return fail(response, error.status, error.code, error.message, origin, error.fields);
      console.error('[Local Admin API]', error);
      return fail(response, 500, 'INTERNAL_ERROR', 'Ocurrió un error interno en la API local.', origin);
    }
  });

  server.on('close', () => db.close());
  return server;
}
