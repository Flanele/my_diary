document.addEventListener('DOMContentLoaded', () => {
    const currentLocation = location.href;
    const menuItems = document.querySelectorAll('.header-nav__link');

    menuItems.forEach(item => {
        if (item.href === currentLocation) {
            item.classList.add('active');
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Наблюдаем за изменениями класса у body
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'class') {
                const isDarkTheme = document.body.classList.contains('dark-theme');
                changeThemeOfEditor(isDarkTheme);
            }
        });
    });

    // Настраиваем наблюдатель для элемента body
    observer.observe(document.body, { attributes: true });

    const isDarkThemeActive = document.body.classList.contains('dark-theme');
    changeThemeOfEditor(isDarkThemeActive);
});

let currentTheme = null;  

// Функция для изменения темы редактора TinyMCE
function changeThemeOfEditor(isDark) {
    if (currentTheme === isDark) {
        return;
    }
    currentTheme = isDark;

    tinymce.remove();
    tinymce.init({
        selector: '#text',
        plugins: 'advlist autolink link image lists charmap preview',
        toolbar: 'undo redo | styleselect | bold italic underline | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
        menubar: false,
        branding: false,
        license_key: 'gpl',
        skin: isDark ? 'oxide-dark' : 'oxide',  
        content_css: isDark ? 'dark' : './css/style/min.css', 
        custom_colors: true,
        textcolor_map: [
            "000000", "Black",
            "FF0000", "Red",
            "00FF00", "Green",
            "0000FF", "Blue",
            "FFFF00", "Yellow"
        ],
        color_map: [
            '#BFEDD2', 'Light Green',
            '#FBEEB8', 'Light Yellow',
            '#F8CAC6', 'Light Red',
            '#ECCAFA', 'Light Purple',
            '#C2E0F4', 'Light Blue',
            '#2DC26B', 'Green',
            '#F1C40F', 'Yellow',
            '#E03E2D', 'Red',
            '#B96AD9', 'Purple',
            '#3598DB', 'Blue',
            '#169179', 'Dark Turquoise',
            '#E67E23', 'Orange',
            '#BA372A', 'Dark Red',
            '#843FA1', 'Dark Purple',
            '#236FA1', 'Dark Blue',
            '#ECF0F1', 'Light Gray',
            '#CED4D9', 'Medium Gray',
            '#95A5A6', 'Gray',
            '#7E8C8D', 'Dark Gray',
            '#34495E', 'Navy Blue',
            '#000000', 'Black',
            '#ffffff', 'White'
        ],
        ui_mode: 'split'
    });
}

