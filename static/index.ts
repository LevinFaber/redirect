const form = document.querySelector("form");
if (form) {
  const urlInput = (form.querySelector("input[name=url]") as HTMLInputElement);
  const keyInput = (form.querySelector("input[name=key]") as HTMLInputElement);
  const errorTarget = (form.querySelector(".error") as HTMLSpanElement);
  formValidator(form, urlInput);
  readError(form, urlInput, keyInput, errorTarget);

  if (keyInput.value === "") keyInput.value = getRandomKey(5);

  urlInput.focus();
}
function formValidator(form: HTMLFormElement, urlInput: HTMLInputElement) {
  urlInput?.addEventListener("paste", (event) => {
    urlInput.value = (event.clipboardData || window.clipboardData).getData('text').replace(/https?:\/\//, "");
    event.preventDefault();
  })
  const domainPlaceholder = Array.from(
    form.querySelectorAll(".domain-placeholder")
  );

  domainPlaceholder.forEach((placeholder) => {
    if (placeholder)
      placeholder.addEventListener("click", () => {
        const targetIdent = (placeholder as HTMLElement).dataset.for;
        const input = form.querySelector(`input[name=${targetIdent}]`);
        if (input != null) (input as HTMLElement).focus();
      });
  });
}
function readError(form: HTMLFormElement, urlInput: HTMLInputElement, keyInput: HTMLInputElement, errorTarget: HTMLElement) {
  const url = new URL(location.href);
  const error = url.searchParams.get('error');
  if (error) {
    const target = url.searchParams.get('url') ?? "";
    const key = url.searchParams.get('key') ?? "";
    errorTarget.innerText = error;
    urlInput.value = target;
    keyInput.value = key;
  }
}

function getRandomKey(x: number): string {
  let out = "";
  for(let i = 0; i < x; i++) {
    out += String.fromCharCode(Math.random() * (122 - 97) + 97);
  }
  return out;
}