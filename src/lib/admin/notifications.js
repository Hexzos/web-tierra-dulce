export class DevAccountNotificationService {
  sendInvitation(){return{delivery:'not_sent',reason:'dev_environment'}}
  sendAccountChangedNotice(){return{delivery:'not_sent',reason:'dev_environment'}}
  sendPasswordReset(){return{delivery:'not_sent',reason:'dev_environment'}}
}
