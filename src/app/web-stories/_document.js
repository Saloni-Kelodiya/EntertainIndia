import Document, { Html, Head, Main } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html amp="">
        <Head>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
          <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>

          <style amp-boilerplate="" dangerouslySetInnerHTML={{
            __html: `body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}`
          }} />
          <noscript>
            <style amp-boilerplate="" dangerouslySetInnerHTML={{ __html: `body{-webkit-animation:none;animation:none}` }} />
          </noscript>

          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
        </Head>
        <body>
          <Main />
          {/* No NextScript for AMP */}
        </body>
      </Html>
    );
  }
}

export default MyDocument;
