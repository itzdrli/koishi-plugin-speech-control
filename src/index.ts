import { Context, Schema } from 'koishi'

export const name = 'speech-control'

export interface Config {
  phrases: Array<string>,
  punishMessage: string,
  muteOrNot: boolean,
  muteTime: number,
  recallOrNot: boolean,
  enabledGroups: any
}

export const usage = `
<h1>言论控制</h1>
<h2> Speech Control </h2>
对你的群友实行言论控制 </br>
bot需要有管理权限/禁言+撤回(删除信息)权限

<h4>Known Issues</h4>
禁言无法在Telegram上使用

<h4>punishMessage</h4>
惩罚信息的前半段，例如 "检测到敏感词, 已撤回并禁言" 的前半段 "检测到敏感词"
`

export const Config: Schema<Config> = Schema.object({
  phrases: Schema.array(String).role('table').description("检测的短语").default(['你干嘛哎哟']),
  punishMessage: Schema.string().description("惩罚信息的前半段").default("检测到敏感词"),
  muteOrNot: Schema.boolean().description("是否禁言").default(true),
  muteTime: Schema.number().default(60000).description("禁言时间(毫秒)"),
  recallOrNot: Schema.boolean().description("是否撤回").default(true),
  enabledGroups: Schema.array(String).description("启用的群组").default([]).required()
})

export function apply(ctx: Context, config: Config) {
  ctx.on('message', (session) => {
    if (session.isDirect === true) return
    if (!config.enabledGroups.includes(session.guildId)) return
    let response = config.punishMessage
    config.phrases.forEach((phrase) => {
      if (session.content.includes(phrase)) {
        if (config.muteOrNot) {
          session.bot.muteGuildMember(session.guildId, session.userId, config.muteTime)
          response += ", 已禁言 "
        }
        if (config.recallOrNot) {
          session.bot.deleteMessage(session.channelId, session.messageId)
          response += ", 已撤回"
        }
        if (config.punishMessage) {
          session.send(response)
        }
        return
      }
      else return
    })
  })
}
