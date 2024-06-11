
const list_tag = ".Nv2PK.THOPZb";
export function geTag() {
  let list_tags = list_tag.split('|');
  let tag = '';
  const tags = list_tags.filter((tag) => {
    let items = document.querySelectorAll(tag.trim());
    if (items.length > 0) {
      return tag.trim();
    }
  })

  return tags[0];
}

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}