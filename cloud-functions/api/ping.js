// 最小探针：零依赖，用于区分「平台/构建问题」与「应用代码问题」
export default function onRequest() {
  return new Response(JSON.stringify({ pong: true, ts: Date.now() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  })
}
