export function openModalAndBlockScroll(dialog) {
    dialog.showModal();
    document.body.classList.add('scroll-block');
}

export function returnScroll() {
    document.body.classList.remove('scroll-block');
}

export function closeModal(dialog) {
    dialog.close();
    returnScroll();
}
