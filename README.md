# react-ssr-on-streaming-function-url

**Keywords:** React Server-side Rendering (SSR), AWS Lambda Function URL, response streaming, serverless.

No Next.js, no Remix, no serverless adapter; this project provides the template for a serverless SSR-enabled React
webapp that can be run right off AWS Lambda Function URL using response streaming.

In [nguyengg/react-ssr-on-lambda](https://github.com/nguyengg/react-ssr-on-lambda) I showed an example of how to write
a Typescript AWS Lambda Function URL handler that renders React content on server-side. The example had one limitation
in that there was no true response streaming since AWS Lambda simply didn't support it at the time.

Since AWS Lambda has introduced a response streaming mode, it's obvious that the demand for React SSR streaming is the
main driver behind that feature; even the [blog post](https://aws.amazon.com/blogs/compute/introducing-aws-lambda-response-streaming/)
introducing the mode only has NodeJS example while streaming support for other languages comes much later with the
introduction of [AWS Lambda Web Adapter](https://aws.amazon.com/blogs/compute/using-response-streaming-with-aws-lambda-web-adapter-to-optimize-performance/)
which finally codifies the [custom runtime specifications](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-custom.html#runtimes-custom-response-streaming)
that makes the feature possible.

## Why not use a framework? 

`<%rant>`

I do recommend using a framework. A long time ago, before functional components had completely taken over, 
[create-react-app](https://create-react-app.dev/) was the way to go. The new [react.dev](https://react.dev) website now
instead [recommends several frameworks](https://react.dev/learn/start-a-new-react-project) such as Next.js, Remix, etc.
In fact, by partnering with Next.js to bring the latest experimental features such as React Server Components into that
framework, there's an implicit acknowledgement that Next.js is probably the best way to develop React apps.

And I agree with the sentiment. I've given the two libraries quite some time for prototyping and a thought came up; what
if I don't need any of those frameworks and just do this on bare AWS Lambda handler? It started out as a thought 
exercise, it was successful and I just kept adding to it, and now it's a fully fledged website for my wife's nail shop
(the stuff is gated behind a login so there's no point in sharing the link to it here :).

I didn't find a lot of examples doing what I did here so wanted to share a template in case it could inspire someone.

`</%rant>`

# Getting Started
After cloning the repo, just run `npm run dev`, the browser will be opened to https://localhost:3000, and you should see
the "Under construction" message.

`npm run build` will produce a production build at `dist` directory. Check buildspec.yml on how to deploy:
* These files are zipped and uploaded to Lambda code: `dist/server/*`, and `dist/app/manifest.json`.
The Lambda function (I named mined `webapp`) must have its handler set to `index.handler` (the default value when you 
create a Node.js Lambda function).
* Static resources are uploaded to S3 bucket.
* CloudFront is set up like this:
  * Path pattern `Default (*)` is sent to my Lambda's function URL with cache policy *CachingDisabled*, and origin request policy 
  *AllViewerExceptHost* (it is critical you do not send the *Host* header to any Lambda endpoint).
  * `/favicon.ico`, `/js/*`, and `/css/*` path patterns are sent to my S3 bucket.
