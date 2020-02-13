function edgeMessageRelayService(req, resp) {
    edgeMessageRelay({
      req: req,
      resp: resp,
      topics: ["one", "two"]
    })
}
