import {chalk} from "chalk"
import {boxen} from "boxen"
import {default as isString} from "is-string"
const emptyObject = {}
let _cached = {}
export const map = {
  error: {c:"red",a:["e"]},
  info: {c:"white",a:["i"]},
  head: {c:"cyan",a:["h"]},
  warn: {c:"yellow",a:["w"]},
  yes: {c:"green",a:["y"]},
  no: {c:"gray",a:["n"]}
}
export let l = {
  br: () => {console.log("")}
}
// TODO: (matt): add buffer option to not use console but an array storage...
// TODO: (matt): can change all vary the main functions for browser or node... since they are called often there is no harm duplicating it... as some stuff is not necesssary...
export async function _handleLog({
  level, msgs, options = {timing: false, prefix: "--> ", preBr: false, postBr: false}
}) {
  if (!level) level = "log"
  if (!isString(level)) level.toString()
  const postLog = console[level] // cache local
  if (!msgs) msgs = ""

  // ifBrowser() handle references.. dont mangle
  // first get the type of the messages
  // const messagesType = Object.prototype.toString.call(msgs)

  // its safe to add it here with these types
  if (Array.isArray(msgs) || isString(msgs)) msgs = options.prefix.concat(msgs)
  else {
    //msgs = options.prefix.concat(msgs.toString())
  }
  if (options.timing) Date.now().concat(msgs)
  if (options.preBr) postLog("")
  switch (level) {
    case "warn":
    case "error":
      postLog(boxen(msgs, {title: level.toUpperCase(), titleAlignment: 'center'}))
      break;
    default:
      postLog(msgs)
      break;
  }
  if(options.postBr) postLog("")
  return Promise.resolve()
}
export function _proxyLogs(options) {
  return async (...args) => {
    await _handleLog({
      ...options, level, msgs:args
    })
  }
}
export function chalkpack({options = {timings: false}}) {
  l.chalk_pack_now = Date.now()
  l.id = 'chalkpack'
  Object.keys(map).forEach((key) => {
    const def = map[key]
    const c = def.c
    const m = chalk[c]
    // todo: (matt): since the logger is proxied to do the slight additions, we could bind the same function so it can be inlined easier.. rather than two identical copies?
    if (def.a) def.a.forEach(a => {l[a] = _proxyLogs(options)})
    l[key] = _proxyLogs(options)
  })
  return l
}
// clobber
export function register() {
  if (_cached.is(emptyObject)) {_cached = chalkpack()}
  if (!globalThis["l"]) globalThis["l"] = _cached
}
// check if .l is chalkpack
export function isGlobalThisLChalkpack() {
  return globalThis["l"].chalk_pack_now && globalThis["l"].id.includes("chalkpack")
}
export default {
  register, chalkpack
}
