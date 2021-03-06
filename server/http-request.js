import http from "http"

const RESPONSE_SUPPORTED_CONTENT_TYPES = /(text\/plain|application\/json)/

const RESPONSE_PARSER_CONTENT_TYPES = [
  {
    test: /text\/plain/,
    encode: "utf-8",
    parser (data) { return data }
  },
  {
    test: /application\/json/,
    encode: "utf-8",
    parser (data) {
      return JSON.parse(data)
    }
  }
]

const httpRequest = {
  get (host, path, callback) {
    try {
      let req = http.request({
        method: "GET",
        host: host,
        path: path
      }, (res) => {
        const { headers } = res
        const { "content-type": contentType } = headers
        const isSupportedContentType = RESPONSE_SUPPORTED_CONTENT_TYPES.test(contentType)
        if (isSupportedContentType) {
          const { encode: resultEncode, parser: resultParser } = RESPONSE_PARSER_CONTENT_TYPES.find((parseContentType) => {
            return parseContentType.test.test(contentType)
          })
          res.setEncoding(resultEncode)
          let result = ""
          res.on("data", (chunk) => {
            result += chunk
          })
          res.on("end", () => {
            const resultParsed = resultParser(result)
            callback(resultParsed)
          })
        }
        else {
          callback()
        }
      })
      req.end()
    }
    catch (error) { throw error }
  }
}

export default httpRequest