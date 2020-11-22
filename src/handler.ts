export async function handleRequest(request: Request) {
  let res = null;
  const path = getPath(request);
  if (path === "/") return await getPage("index");
  if (path === "/success") return await getPage("success");
  if (path === "/favicon.ico") return new Response();
  if (path === "/add") {
    res = await addNewRedirect(request)
  } else if (path.indexOf("/r/") === 0) {
    res = await executeRedirect(request);
  }

  if (res != null) return res;

  return new Response(null, { status: 404 })
}

async function addNewRedirect(request: Request) {
  const { prefixedUrl, key, expiration } = getParameters(request);

  if (!key || !prefixedUrl) return new Response(null, {status: 400, statusText: "Missing Key or URL"});
  
  const entry = await getFromKV(key);
  if (entry != null) {
    return redirectFrontendError(request, "This key is already taken please choose another.");
  }
  const config = {
    expiration,
    metadata: {
      addedBy: request.headers.get("cf-connecting-ip") || "",
      from: request.headers.get("cf-ipcountry") || "",
      addedOn: new Date()
    }
  }
  const response = await REDIRECTS.put(key, prefixedUrl, config)
  .then(kvRes => {
    return Response.redirect(`${getOrigin(request)}/success?url=${getOrigin(request) + "/r/" + key}`);
  })
  .catch(error => {
    console.error(error);
    return new Response("Error Occured", {status: 500});
    });
  return response;
}

async function executeRedirect(request: Request) {
  const path = getPath(request);
  const key = path.replace("/r/", "");
  const entry = await getFromKV(key);
  if (entry) {
    return Response.redirect(entry, 301);
  }
}

async function getFromKV(key: string) {
  return await REDIRECTS.get(key);
}

function redirectFrontendError(request: Request, text: string): Response {
  const { urlWithoutProto, key } = getParameters(request);
  return Response.redirect(`${getOrigin(request)}?error=${text}&url=${urlWithoutProto.replace("https://", "")}&key=${key}`);
}

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return url.origin;
}

function getPath(request: Request) {
  const url = new URL(request.url);

  return url.pathname;
}

function getParameters(request: Request) {
  const { searchParams: params } = new URL(request.url);
  const { key, url, expiration } = Object.fromEntries(params);

  const urlWithoutProto = url.replace(/https?:\/\//, "");
  const prefixedUrl = "https://" + url;

  return {
    key, urlWithoutProto, prefixedUrl, expiration
  }
}

async function getPage(pageName: string): Promise<Response> {
  const html = await STATIC.get(`${pageName}.html`);
  return new Response(html, {status: 200, headers: [
    [
      'Content-Type',
      'text/html; charset=utf-8'
    ]
  ]});
} 