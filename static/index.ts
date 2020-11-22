formValidator();
function formValidator() {
  const form = document.querySelector("form");
  if (form == null) return;

  const urlInput = (form.querySelector("input[name=url]") as HTMLInputElement);
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
