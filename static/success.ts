readQueryString();
function readQueryString() {
  const urlObj = new URL(window.location.href);
  const target = urlObj.searchParams.get('url'); 
  
  const anchor = document.querySelector("a.target");
  if (anchor != null) {
    (anchor as HTMLAnchorElement).innerHTML = (target as string);
    (anchor as HTMLAnchorElement).href = (target as string);

  }
}