"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
const MENU_TYPES = [
    { code: 'main', sortOrder: 0, names: { ru: 'Основное меню', en: 'Main menu' } },
    { code: 'bar', sortOrder: 1, names: { ru: 'Барное меню', en: 'Bar menu' } },
    { code: 'tea', sortOrder: 2, names: { ru: 'Чайная карта', en: 'Tea menu' } },
    { code: 'wine', sortOrder: 3, names: { ru: 'Винная карта', en: 'Wine list' } },
    { code: 'kids', sortOrder: 4, names: { ru: 'Детское меню', en: 'Kids menu' } },
];
const LANGUAGES = [
    { code: 'ru', name: 'Русский', sortOrder: 0 },
    { code: 'en', name: 'English', sortOrder: 1 },
    { code: 'kk', name: 'Қазақша', sortOrder: 2 },
];
const MAIN_MENU_CATEGORIES = [
    {
        nameRu: 'Холодные закуски',
        nameEn: 'Cold appetizers',
        sortOrder: 0,
        items: [
            { nameRu: 'Мясная тарелка', nameEn: 'Meat plate', price: 255000, weightOrVolume: '250 / 25', descriptionRu: 'Бастурма, казы, рулет говяжий, рулет бараний, колбаса с/к' },
            { nameRu: 'Сырная тарелка', nameEn: 'Cheese plate', price: 255000, weightOrVolume: '250 / 100', descriptionRu: 'Камамбер, Пармезан, Дор-блю, Свалио' },
            { nameRu: 'Овощная тарелка', nameEn: 'Vegetable plate', price: 86000, weightOrVolume: '250 гр.', descriptionRu: 'Помидор, огурец, лук, редис, болгарский перец, зелень в ассортименте' },
            { nameRu: 'Соленья', nameEn: 'Pickles', price: 90000, weightOrVolume: '300/25', descriptionRu: 'Соленый огурец, соленый помидор, соленый патиссон, лук Анзор, капуста квашенная, маринованный чеснок' },
            { nameRu: 'Селедочка с картофелем', nameEn: 'Herring with potatoes', price: 72000, weightOrVolume: '100/65', descriptionRu: 'Филе сельди, картофель отварной, репчатый лук' },
            { nameRu: 'Тар-тар из телятины', nameEn: 'Veal tartare', price: 115000, weightOrVolume: '160/60', descriptionRu: 'Филе телятины, соленый огурец, каперсы, горчица, лук красный, перепелиное яйцо' },
            { nameRu: 'Тар-тар из тунца', nameEn: 'Tuna tartare', price: 174000, weightOrVolume: '160/60', descriptionRu: 'Филе тунца, авокадо, сок лимона, оливковое масло, зеленый лук, каперсы' },
            { nameRu: 'Буррата с клубникой и томатами', nameEn: 'Burrata with strawberry and tomatoes', price: 144000, weightOrVolume: '160/80', descriptionRu: 'Сыр буррата, клубника, помидоры черри, бальзамический крем соус' },
            { nameRu: 'Сырные шарики', nameEn: 'Cheese balls', price: 72000, weightOrVolume: '180/30/15', descriptionRu: 'Сыр, помидор черри, соус Тар Тар' },
            { nameRu: 'Гренки чесночные', nameEn: 'Garlic croutons', price: 48000, weightOrVolume: '150/30/2', descriptionRu: 'Хлеб бородинский, чесночный соус, зелень, соус Тар Тар' },
            { nameRu: 'Долма', nameEn: 'Dolma', price: 60000, weightOrVolume: '200/20', descriptionRu: 'Виноградный лист, говядина, булгур, лук репчатый, сметана' },
            { nameRu: 'Чупонча', nameEn: 'Chuponcha', price: 63000, weightOrVolume: '250 гр.', descriptionRu: 'Сузьма, помидоры, огурцы, зелень в ассортименте, лук красный, чеснок' },
            { nameRu: 'Фаршированная ножка перепелки', nameEn: 'Stuffed quail leg', price: 120000, weightOrVolume: '150/100', descriptionRu: 'Перепелка, демиглас соус, картофельное пюре, лук репчатый, вяленные помидоры, каперсы, сливочное масло' },
            { nameRu: 'Мидии в сливочном соусе', nameEn: 'Mussels in cream sauce', price: 150000, weightOrVolume: '160/75/15', descriptionRu: 'Мидии в панцире, шпинат, сливки, сыр, лимон, микс салата' },
        ],
    },
    {
        nameRu: 'Горячие закуски',
        nameEn: 'Hot appetizers',
        sortOrder: 1,
        items: [],
    },
    {
        nameRu: 'Салаты',
        nameEn: 'Salads',
        sortOrder: 2,
        items: [
            { nameRu: 'Цезарь с курицей', nameEn: 'Caesar with chicken', price: 94000, weightOrVolume: '250 гр.', descriptionRu: 'Айсберг, сухарики, куриная грудка, пармезан, помидор черри, перепелиное яйцо, соус "Цезарь"' },
            { nameRu: 'Цезарь с креветками', nameEn: 'Caesar with shrimp', price: 137000, weightOrVolume: '250 гр.', descriptionRu: 'Айсберг, сухарики, креветки, пармезан, помидор черри, перепелиное яйцо, соус "Цезарь"' },
            { nameRu: 'Салат с консервированным тунцом', nameEn: 'Canned tuna salad', price: 96000, weightOrVolume: '250 гр.', descriptionRu: 'Айсберг, лук красный, помидор, огурец, филе тунца, оливковое масло' },
            { nameRu: 'Теплый салат с лососем', nameEn: 'Warm salmon salad', price: 130000, weightOrVolume: '220 гр.', descriptionRu: 'Микс салата, кунжут, лук порей, филе семги, устричный соус' },
            { nameRu: 'Оливье с говяжьим языком', nameEn: 'Olivier with beef tongue', price: 78000, weightOrVolume: '200 гр.', descriptionRu: 'Язык говяжий, картофель, морковь, майонез, куриное яйцо, зеленый горошек, соленый огурец' },
            { nameRu: 'Салат с тунцом', nameEn: 'Tuna salad', price: 144000, weightOrVolume: '230 гр.', descriptionRu: 'Филе тунца, микс салата, помидор черри, перец болгарский, кунжут, бальзам. соус' },
            { nameRu: 'Овощной салат', nameEn: 'Vegetable salad', price: 54000, weightOrVolume: '220 гр.', descriptionRu: 'Микс салата, помидор, огурец, редис, дайкон, оливковое масло, бальзам. уксус' },
            { nameRu: 'Греческий', nameEn: 'Greek salad', price: 94000, weightOrVolume: '250 гр.', descriptionRu: 'Микс салата, огурец, помидор, болгарский перец, фетакса, оливки, маслины, оливковое масло' },
            { nameRu: 'Салат из баклажан', nameEn: 'Eggplant salad', price: 110000, weightOrVolume: '250 гр.', descriptionRu: 'Баклажаны, болгарский перец, соевый соус, помидор черри, сыр Фета, лук красный, чеснок, зелень в ассорт.' },
            { nameRu: 'Веганский салат', nameEn: 'Vegan salad', price: 75000, weightOrVolume: '230 гр.', descriptionRu: 'Микс салата, горчичная заправка, редис, огурец, морковь, булгур' },
            { nameRu: 'Рукола с телятиной', nameEn: 'Arugula with veal', price: 107000, weightOrVolume: '220 гр.', descriptionRu: 'Рукола, филе телятины, помидор черри, пармезан, бальзамический соус' },
            { nameRu: 'Рукола с креветками', nameEn: 'Arugula with shrimp', price: 132000, weightOrVolume: '200 гр.', descriptionRu: 'Рукола, креветки, пармезан, бальзамический соус' },
            { nameRu: 'Рукола со свеклой', nameEn: 'Arugula with beetroot', price: 90000, weightOrVolume: '230 гр.', descriptionRu: 'Рукола, свекла, фирменная заправка, жаренный сыр, кедровые орехи' },
            { nameRu: 'Салат с лососем и авокадо', nameEn: 'Salmon and avocado salad', price: 174000, weightOrVolume: '250 гр.', descriptionRu: 'Микс салата, авокадо, филе семги, грецкий орех, оливки, лук красный, соевые бобы, апельсиновый соус' },
            { nameRu: 'Салат "Эмирский"', nameEn: 'Emir salad', price: 82000, weightOrVolume: '220 гр.', descriptionRu: 'Помидор черри, лук красный, оливковое масло, базилик, панир' },
            { nameRu: 'Винегрет с яблоком', nameEn: 'Vinegret with apple', price: 68000, weightOrVolume: '220 гр.', descriptionRu: 'Свекла, огурцы маринованные, яблоко, кукуруза консервированная, масло растительное, лимонный фреш' },
        ],
    },
    {
        nameRu: 'Супы',
        nameEn: 'Soups',
        sortOrder: 3,
        items: [
            { nameRu: 'Борщ со сметаной', nameEn: 'Borscht with sour cream', price: 66000, weightOrVolume: '300 / 30', descriptionRu: 'Говяжий язык, бульон, свекла, капуста, картофель, сметана, чесночные гренки, зелень' },
            { nameRu: 'Солянка сборная', nameEn: 'Assorted solyanka', price: 66000, weightOrVolume: '300 / 30', descriptionRu: 'Говяжий бульон, мясо копченое, курица, марин. огурец, сметана, маслины, зелень' },
            { nameRu: 'Суп из морепродуктов', nameEn: 'Seafood soup', price: 165000, weightOrVolume: '350 гр.', descriptionRu: 'Креветки, мидии, филе судака, филе семги, помидор, базилик, рыбный бульон' },
            { nameRu: 'Крем-суп из тыквы (Сезонное)', nameEn: 'Pumpkin cream soup (Seasonal)', price: 55000, weightOrVolume: '300 / 30', descriptionRu: 'Тыква, сливки, сухарики, овощной бульон' },
            { nameRu: 'Куриная лапша', nameEn: 'Chicken noodle soup', price: 55000, weightOrVolume: '300 / 30', descriptionRu: 'Домашняя курица, лапша, картофель, морковь, зелень, куриное филе, бульон' },
            { nameRu: 'Овощной суп', nameEn: 'Vegetable soup', price: 55000, weightOrVolume: '300 / 30', descriptionRu: 'Цветная капуста, броколли, лук, морковь, кукуруза, овощной бульон, помидор' },
            { nameRu: 'Том-Ям', nameEn: 'Tom Yum', price: 156000, weightOrVolume: '300 гр.', descriptionRu: 'Паста том-ям, креветки, перец чили, шампиньоны, помидоры черри, бульон' },
        ],
    },
    {
        nameRu: 'Блюда из мяса',
        nameEn: 'Meat dishes',
        sortOrder: 4,
        items: [
            { nameRu: 'Телятина с овощами', nameEn: 'Veal with vegetables', price: 172000, weightOrVolume: '350 / 150 / 10', descriptionRu: 'Филе телятины, помидор, лук, болгарский перец, специи, соевый соус' },
            { nameRu: 'Медальоны из телятины на гриле', nameEn: 'Veal medallions on grill', price: 156000, weightOrVolume: '180 / 15 / 2', descriptionRu: 'Филе телятины, помидор черри, зелень' },
            { nameRu: 'Бон филе под сливочно-грибным соусом', nameEn: 'Beef fillet with mushroom cream sauce', price: 156000, weightOrVolume: '180 / 15 / 2', descriptionRu: 'Филе телятины, сливочно-грибной соус, зелень, помидор черри' },
            { nameRu: 'Баранина тушеная с овощами', nameEn: 'Braised lamb with vegetables', price: 156000, weightOrVolume: '500 / 10', descriptionRu: 'Баранья лопатка, цуккини, баклажан, помидор, болгарский перец, специи' },
            { nameRu: 'Стейк "Тибон" на гриле', nameEn: 'T-bone steak on grill', price: 58000, weightOrVolume: '100 гр.', descriptionRu: 'Говядина на кости, помидор черри, специи' },
            { nameRu: 'Корейка говяжая на гриле', nameEn: 'Beef loin on grill', price: 58000, weightOrVolume: '100 гр.', descriptionRu: 'Говяжья корейка, помидор черри, специи' },
            { nameRu: 'Язык отварной', nameEn: 'Boiled tongue', price: 96000, weightOrVolume: '100/45', descriptionRu: 'Язык говяжий, соус, хрен, зелень' },
            { nameRu: 'Говяжьи ребра на гриле', nameEn: 'Beef ribs on grill', price: 150000, weightOrVolume: '400 / 50 / 15', descriptionRu: 'Говяжьи ребра, специи, соус Аджика' },
            { nameRu: 'Стейк "Тольята"', nameEn: 'Tolyatta steak', price: 75000, weightOrVolume: '100 гр.', descriptionRu: 'Бон филе, сливочно-грибной соус, зелень, специи' },
            { nameRu: 'Мясо по-Бухарски', nameEn: 'Meat Bukhara style', price: 145000, descriptionRu: 'Говядина томленая, картофельное пюре, соус Демиглас, соль, черный молотый перец' },
            { nameRu: 'Голень баранья', nameEn: 'Lamb shank', price: 145000, weightOrVolume: '1 шт.', descriptionRu: 'Баранья голень, соус Демиглас, гороховое пюре' },
        ],
    },
    {
        nameRu: 'Блюда из курицы',
        nameEn: 'Chicken dishes',
        sortOrder: 5,
        items: [
            { nameRu: 'Цыпленок на гриле', nameEn: 'Grilled chicken', price: 118000, weightOrVolume: '500 / 50 / 10', descriptionRu: 'Тушка цыпленка, томатный соус, зелень, помидор черри' },
            { nameRu: 'Куриная грудка на гриле', nameEn: 'Grilled chicken breast', price: 90000, weightOrVolume: '180 / 20', descriptionRu: 'Куриное филе, микс салата, зелень, помидор черри' },
            { nameRu: 'Куриные крылья на гриле', nameEn: 'Grilled chicken wings', price: 105000, weightOrVolume: '450 / 50 / 15', descriptionRu: 'Куриные крылья, томатный соус, зелень' },
            { nameRu: 'Куриные котлеты', nameEn: 'Chicken cutlets', price: 76000, weightOrVolume: '180 / 40 / 2', descriptionRu: 'Куриное филе, лук, специи, томатный соус, помидор черри' },
            { nameRu: 'Фрикасе', nameEn: 'Fricassee', price: 112000, weightOrVolume: '250 / 40 / 2', descriptionRu: 'Куриное филе, болгарский перец, шампиньоны, сливочный соус, репчатый лук' },
            { nameRu: 'Перепелка запеченная', nameEn: 'Baked quail', price: 105000, weightOrVolume: '2 шт', descriptionRu: 'Перепелка, соус красный' },
        ],
    },
    {
        nameRu: 'Пасты',
        nameEn: 'Pasta',
        sortOrder: 6,
        items: [
            { nameRu: 'Карбонара', nameEn: 'Carbonara', price: 115000, weightOrVolume: '300 гр.', descriptionRu: 'Спагетти, бекон, пармезан, сливочный соус, куриное яйцо' },
            { nameRu: 'Феттуччини с креветками', nameEn: 'Fettuccine with shrimp', price: 156000, weightOrVolume: '300 гр.', descriptionRu: 'Феттуччини, креветки, сливочный соус, соус чили, зелень, пармезан' },
            { nameRu: 'Феттуччини с грибами', nameEn: 'Fettuccine with mushrooms', price: 99000, weightOrVolume: '300 гр.', descriptionRu: 'Феттуччини, шампиньоны, пармезан, сливочный соус, зелень' },
            { nameRu: 'Феттуччини с соусом песто', nameEn: 'Fettuccine with pesto', price: 99000, weightOrVolume: '300 гр.', descriptionRu: 'Феттуччини, соус песто, пармезан, помидоры черри' },
            { nameRu: 'Альфредо', nameEn: 'Alfredo', price: 103000, weightOrVolume: '300 гр.', descriptionRu: 'Спагетти, куриное филе, болгарский перец, пармезан, соус чили, сливочный соус, зелень' },
            { nameRu: 'Болоньезе', nameEn: 'Bolognese', price: 94000, weightOrVolume: '300 гр.', descriptionRu: 'Спагетти, лук, фарш говяжий, томатный соус, орегано' },
            { nameRu: 'Равиоли с ягненком', nameEn: 'Ravioli with lamb', price: 119000, weightOrVolume: '300 гр.', descriptionRu: 'Ягненок, шпинат, сливочное масло' },
        ],
    },
    {
        nameRu: 'Рыбные блюда',
        nameEn: 'Fish dishes',
        sortOrder: 7,
        items: [
            { nameRu: 'Котлета из карпа', nameEn: 'Carp cutlet', price: 125000, weightOrVolume: '180 / 150 / 20', descriptionRu: 'Карп, судак, пюре, соус Тар Тар, лимон, специи' },
            { nameRu: 'Стейк из семги на гриле', nameEn: 'Grilled salmon steak', price: 190000, weightOrVolume: '180 / 75 / 40', descriptionRu: 'Филе семги, лимон, микс салата, соус Песто' },
            { nameRu: 'Стейк из семги на пару', nameEn: 'Steamed salmon steak', price: 190000, weightOrVolume: '180 / 75 / 40', descriptionRu: 'Филе семги, лимон, микс салата, соус Песто' },
            { nameRu: 'Фарфалле из семги', nameEn: 'Salmon farfalle', price: 156000, weightOrVolume: '300 гр.', descriptionRu: 'Фарфалле, филе семги, томатный соус, сливочный соус, орегано, цуккини, пармезан' },
            { nameRu: 'Семга в сливочном соусе', nameEn: 'Salmon in cream sauce', price: 178000, weightOrVolume: '250 / 75', descriptionRu: 'Филе семги, лимон, шпинат, сливочный соус, лук порей' },
            { nameRu: 'Филе судака с овощами', nameEn: 'Pike perch fillet with vegetables', price: 150000, weightOrVolume: '300 / 75', descriptionRu: 'Филе судака, помидор черри, цуккини, болгарский перец, лук красный, устричный соус' },
            { nameRu: 'Сибас на гриле', nameEn: 'Grilled sea bass', price: 178000, weightOrVolume: '1 шт.', descriptionRu: 'Сибас тушка, лимон, соус Песто' },
            { nameRu: 'Сибас на пару', nameEn: 'Steamed sea bass', price: 178000, weightOrVolume: '1 шт.', descriptionRu: 'Сибас тушка, лимон, соус Песто' },
            { nameRu: 'Мидии томлённые с овощами (на двоих)', nameEn: 'Braised mussels with vegetables (for two)', price: 320000, weightOrVolume: '400 гр.', descriptionRu: 'Мидии в ракушке, лук репчатый, болгарский перец, помидоры, орегано, розмарин, вино белое, сливки' },
            { nameRu: 'Креветки в устричном соусе', nameEn: 'Shrimp in oyster sauce', price: 150000, weightOrVolume: '150/75/15', descriptionRu: 'Креветки, лимон, устричный соус, микс салата' },
        ],
    },
    {
        nameRu: 'Соуса',
        nameEn: 'Sauces',
        sortOrder: 8,
        items: [
            { nameRu: 'Кетчуп Heinz', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Майонез', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Горчица', nameEn: 'Mustard', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Хрен', nameEn: 'Horseradish', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Тар Тар', nameEn: 'Tartar', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Соевый', nameEn: 'Soy', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Барбекю', nameEn: 'BBQ', price: 25000, weightOrVolume: '50 гр.' },
            { nameRu: 'Томатный', nameEn: 'Tomato', price: 25000, weightOrVolume: '50 гр.' },
        ],
    },
    {
        nameRu: 'Гарниры',
        nameEn: 'Side dishes',
        sortOrder: 9,
        items: [
            { nameRu: 'Картофель фри', nameEn: 'French fries', price: 42000, weightOrVolume: '150 гр.' },
            { nameRu: 'Картофельное пюре', nameEn: 'Mashed potatoes', price: 42000, weightOrVolume: '150 гр.' },
            { nameRu: 'Картофель по деревенски', nameEn: 'Country-style potatoes', price: 42000, weightOrVolume: '150 гр.' },
            { nameRu: 'Овощи на гриле', nameEn: 'Grilled vegetables', price: 42000, weightOrVolume: '250 гр.' },
            { nameRu: 'Рис с овощами', nameEn: 'Rice with vegetables', price: 42000, weightOrVolume: '180 гр.' },
            { nameRu: 'Овощное рагу', nameEn: 'Vegetable stew', price: 42000, weightOrVolume: '220 гр.' },
            { nameRu: 'Булгур отварной', nameEn: 'Boiled bulgur', price: 42000, weightOrVolume: '180 гр.' },
        ],
    },
    {
        nameRu: 'Десерты',
        nameEn: 'Desserts',
        sortOrder: 10,
        items: [
            { nameRu: 'Шоколадный фондан', nameEn: 'Chocolate fondant', price: 60000 },
            { nameRu: 'Тирамису', nameEn: 'Tiramisu', price: 45000 },
            { nameRu: 'Пана-кота', nameEn: 'Panna cotta', price: 60000 },
            { nameRu: 'Чизкейк', nameEn: 'Cheesecake', price: 60000 },
            { nameRu: 'Штрудель яблочный', nameEn: 'Apple strudel', price: 60000 },
            { nameRu: 'Милфей клубничный', nameEn: 'Strawberry millefeuille', price: 60000 },
            { nameRu: 'Сорбет в ассортименте', nameEn: 'Sorbet in assortment', price: 45000 },
        ],
    },
];
const BAR_MENU_CATEGORIES = [
    {
        nameRu: 'Коктейли',
        nameEn: 'Cocktails',
        sortOrder: 0,
        items: [
            { nameRu: 'Классический Мохито', nameEn: 'Classic Mojito', price: 42000, descriptionRu: 'Сахарный сироп, фреш лимона, мята, спрайт', descriptionEn: 'Sugar syrup, lemon fresh, mint, sprite' },
            { nameRu: 'Мохито маракуйя', nameEn: 'Passion fruit Mojito', price: 47000, descriptionRu: 'Содовая, лимон, мята, пюре маракуйя, фреш лимона', descriptionEn: 'Soda drink, lemon, mint, passion fruit puree, lemon juice' },
            { nameRu: 'Мохито Манго', nameEn: 'Mango Mojito', price: 47000, descriptionRu: 'Содовая, лимон фреш, мята, пюре манго', descriptionEn: 'Soda drink, lemon fresh, mint, mango puree' },
            { nameRu: 'Элис', nameEn: 'Alice', price: 46000, descriptionRu: 'Киви, мята, сироп киви, яблочный сок, фреш лимона', descriptionEn: 'Kiwi, mint, kiwi syrup, apple juice, lemon juice' },
            { nameRu: 'Манго слинг', nameEn: 'Mango sling', price: 52000, descriptionRu: 'Имбирный сироп, лимон фреш, мята, содовая, пюре манго', descriptionEn: 'Ginger syrup, fresh lemon, mint, soda drink, mango puree' },
            { nameRu: 'Персик маракуйя', nameEn: 'Passion fruit peach', price: 54000, descriptionRu: 'Содовая, гренадин, пюре маракуйя, миндальный сироп, персиковый сироп, лимон фреш', descriptionEn: 'Soda, grenadine, passion fruit puree, almond syrup, peach syrup, lemon fresh' },
            { nameRu: 'Апельсиновый коллинз', nameEn: 'Orange Collins', price: 41000, descriptionRu: 'Спрайт, апельсиновый сок, гренадин', descriptionEn: 'Sprite, orange juice, grenadine' },
            { nameRu: 'Клубничный слинг', nameEn: 'Strawberry sling', price: 54000, descriptionRu: 'Лимон фреш, спрайт, клубника, имбирь, мята', descriptionEn: 'Lemon fresh, Sprite, strawberry, ginger, mint' },
            { nameRu: 'Грейпфрутовый коктейль', nameEn: 'Grapefruit cocktail', price: 35000, descriptionRu: 'Апельсин, грейфрукт, пюре маракуя, содовая', descriptionEn: 'Orange, grapefruit, passion fruit puree, soda' },
            { nameRu: 'Чистая страсть', nameEn: 'Pure passion', price: 53000, descriptionRu: 'Сироп карамель, лимон фреш, апельсиновый сок, содовая, пюре маракуйя', descriptionEn: 'Caramel syrup, lemon juice, orange juice, soda, passion fruit puree' },
        ],
    },
    {
        nameRu: 'Лимонады',
        nameEn: 'Lemonades',
        sortOrder: 1,
        items: [
            { nameRu: 'Яблочный лимонад', nameEn: 'Apple lemonade', price: 38000 },
            { nameRu: 'Базиликовый лимонад', nameEn: 'Basil lemonade', price: 38000 },
            { nameRu: 'Кокосовый лимонад', nameEn: 'Coconut lemonade', price: 38000 },
            { nameRu: 'Классический лимонад', nameEn: 'Classic lemonade', price: 38000 },
            { nameRu: 'Огуречный лимонад', nameEn: 'Cucumber lemonade', price: 38000 },
        ],
    },
    {
        nameRu: 'Фреши',
        nameEn: 'Fresh juices',
        sortOrder: 2,
        items: [
            { nameRu: 'Апельсиновый', nameEn: 'Orange', price: 65000, weightOrVolume: '250 мл' },
            { nameRu: 'Яблочный', nameEn: 'Apple', price: 40000, weightOrVolume: '250 мл' },
            { nameRu: 'Морковный', nameEn: 'Carrot', price: 40000, weightOrVolume: '250 мл' },
            { nameRu: 'Арбузный (Сезонный)', nameEn: 'Watermelon (Seasonal)', price: 40000 },
            { nameRu: 'Дынный (Сезонный)', nameEn: 'Melon (Seasonal)', price: 40000 },
        ],
    },
    {
        nameRu: 'Содовые напитки',
        nameEn: 'Soda drinks',
        sortOrder: 3,
        items: [
            { nameRu: 'Borjomi', price: 35000 },
            { nameRu: 'Bonaqua', price: 10000, weightOrVolume: '0.5' },
            { nameRu: 'Bonaqua', price: 15000, weightOrVolume: '1.5' },
            { nameRu: 'Chortoq', price: 25000, weightOrVolume: '0.5' },
            { nameRu: 'Coca Cola', price: 15000, weightOrVolume: '0.5' },
            { nameRu: 'Fanta', price: 15000, weightOrVolume: '0.5' },
            { nameRu: 'Sprite', price: 15000, weightOrVolume: '0.5' },
        ],
    },
    {
        nameRu: 'Соки в ассортименте',
        nameEn: 'Juices in assortment',
        sortOrder: 4,
        items: [
            { nameRu: 'Соки в ассортименте', nameEn: 'Lemon-mint, apple, cherry, peach, berry mix, orange', price: 40000, descriptionRu: 'Лимон-мята, яблоко, вишня, персик, ягодный микс, апельсин' },
        ],
    },
    {
        nameRu: 'Алкогольные коктейли',
        nameEn: 'Alcoholic cocktails',
        sortOrder: 5,
        items: [
            { nameRu: 'Мохито', nameEn: 'Mojito', price: 88000, descriptionRu: 'Ром, сахарный сироп, фреш лимона, мята, спрайт', descriptionEn: 'Rum, sugar syrup, lemon fresh, mint, sprite' },
            { nameRu: 'Апероль Шприц', nameEn: 'Aperol Spritz', price: 120000, descriptionRu: 'Апероль, содовая, Prossecco', descriptionEn: 'Aperol, soda, Prossecco' },
            { nameRu: 'Элис', nameEn: 'Alice', price: 78000, descriptionRu: 'Киви, лимон фреш, сироп киви, водка, яблочный сок', descriptionEn: 'Kiwi, lemon fresh, kiwi syrup, vodka, apple juice' },
            { nameRu: 'Негрони', nameEn: 'Negroni', price: 96000, descriptionRu: 'Джин, мартини Rosso, апельсин, кампари', descriptionEn: 'Gin, Martini Rosso, orange, campari' },
            { nameRu: 'Олд фешион', nameEn: 'Old Fashion', price: 80000, descriptionRu: 'Ангостура, виски Ballantine`s, сахар', descriptionEn: 'Angostura, Ballantine\'s whiskey, sugar' },
            { nameRu: 'Дайкири с медом и базиликом', nameEn: 'Daiquiri with honey and basil', price: 82000, descriptionRu: 'Базилик, лимон фреш, ром, медовый сироп', descriptionEn: 'Basil, lemon fresh, rum, honey syrup' },
            { nameRu: 'Мартини Рояль', nameEn: 'Martini Royal', price: 75000, descriptionRu: 'Содовая, лимон, мартини Bianco, водка, мята, яблочный сок', descriptionEn: 'Soda, lemon, Martini Bianco, vodka, mint, apple juice' },
            { nameRu: 'Джон Коллинз', nameEn: 'John Collins', price: 82000, descriptionRu: 'Джин, лимон фреш, сахарный сироп, содовая, Ангостура', descriptionEn: 'Gin, lemon fresh, sugar syrup, soda, Angostura' },
            { nameRu: 'Между простынями', nameEn: 'Between the sheets', price: 92000, descriptionRu: 'Ром, коньяк, куантро, лимон фреш', descriptionEn: 'Rum, cognac, cointreau, fresh lemon' },
            { nameRu: 'Лонг айленд', nameEn: 'Long Island', price: 96000, descriptionRu: 'Джин, кока кола, куантро, лимон, ром, сахарный сироп, водка, текила', descriptionEn: 'Gin, Coke, Cointreau, lemon, rum, sugar syrup, vodka, tequila' },
            { nameRu: 'Каламфур', nameEn: 'Qalamfur', price: 82000, descriptionRu: 'Табаско, лимон фреш, сахарный сироп, текила', descriptionEn: 'Tabasco, lemon juice, sugar syrup, tequila' },
        ],
    },
    {
        nameRu: 'Коньяк',
        nameEn: 'Cognac',
        sortOrder: 6,
        items: [
            { nameRu: 'Samarkand', price: 20000, weightOrVolume: '0.050', descriptionRu: '120 000 за 0.5' },
            { nameRu: 'Toshkent XO', price: 28000, weightOrVolume: '0.050', descriptionRu: '230 000 за 0.5' },
            { nameRu: 'Tambour', price: 43000, weightOrVolume: '0.050', descriptionRu: '360 000 за 0.5' },
            { nameRu: 'Hennessy', price: 94000, weightOrVolume: '0.050', descriptionRu: '1 800 000 за 1' },
            { nameRu: 'Sarajishvili 5*', price: 65000, weightOrVolume: '0.050', descriptionRu: '600 000 за 0.5' },
        ],
    },
    {
        nameRu: 'Виски',
        nameEn: 'Whiskey',
        sortOrder: 7,
        items: [
            { nameRu: "Ballantine's", price: 65000, weightOrVolume: '0.050', descriptionRu: '1 150 000 за 1' },
            { nameRu: 'Chivas 12', price: 80000, weightOrVolume: '0.050', descriptionRu: '1 400 000 за 1' },
            { nameRu: 'Glenmorangie', price: 90000, weightOrVolume: '0.050', descriptionRu: '1 650 000 за 1' },
        ],
    },
    {
        nameRu: 'Водка',
        nameEn: 'Vodka',
        sortOrder: 8,
        items: [
            { nameRu: 'Alaska', price: 140000, weightOrVolume: '0.5' },
            { nameRu: 'Yagona', price: 170000, weightOrVolume: '0.5' },
            { nameRu: 'Alpha', price: 250000, weightOrVolume: '0.7' },
            { nameRu: 'Gold Uzbekistan', price: 380000, weightOrVolume: '0.7' },
            { nameRu: 'Finlandia', price: 720000, weightOrVolume: '1.0' },
            { nameRu: 'Gray Goose', price: 1250000, weightOrVolume: '0.5' },
        ],
    },
    {
        nameRu: 'Пиво',
        nameEn: 'Beer',
        sortOrder: 9,
        items: [
            { nameRu: 'Sarbast нефильтрованное (разливное)', nameEn: 'Sarbast unfiltered (draft)', price: 35000, weightOrVolume: '0.5' },
            { nameRu: 'Sarbast фильтрованное (разливное)', nameEn: 'Sarbast filtered (draft)', price: 35000, weightOrVolume: '0.5' },
        ],
    },
    {
        nameRu: 'Фирменные чаи',
        nameEn: 'Branded teas',
        sortOrder: 10,
        items: [
            { nameRu: 'Чайный латте', nameEn: 'Tea latte', price: 40000 },
            { nameRu: 'Марокканский', nameEn: 'Moroccan', price: 34000, descriptionRu: 'Корица, гвоздика, бадьян, мята, лимон, апельсин', descriptionEn: 'Cinnamon, cloves, cardamom, mint, lemon, orange' },
            { nameRu: 'Имбирный настой', nameEn: 'Ginger infusion', price: 40000, descriptionRu: 'Имбирь, лимон, гвоздика, мед, чабрец, черный чай', descriptionEn: 'Ginger, lemon, cloves, honey, thyme, black tea' },
            { nameRu: 'Чайный цитрус', nameEn: 'Tea citrus', price: 35000, descriptionRu: 'Каркаде, мед, апельсин, сахар', descriptionEn: 'Carcade, honey, orange, sugar' },
            { nameRu: 'Согревающий восточный мед', nameEn: 'Warming oriental honey', price: 43000, descriptionRu: 'Сироп маракуйя, ананасовый сок, апельсин, лимон, корица, грейпфрут', descriptionEn: 'Passion fruit syrup, pineapple juice, orange, lemon, cinnamon, grapefruit' },
            { nameRu: 'Космо Ти', nameEn: 'Cosmo T', price: 41000, descriptionRu: 'Сироп маракуйя, яблочный сок, клюквенный сироп, грейпфрут, лимон, корица, апельсин, гвоздика', descriptionEn: 'Passion fruit syrup, apple juice, cranberry syrup, grapefruit, lemon, cinnamon, orange, cloves' },
            { nameRu: 'Таинственная Азия', nameEn: 'Mysterious Asia', price: 35000, descriptionRu: 'Корица, перец душистый, гвоздика, бадьян, чай черный, кардамон', descriptionEn: 'Cinnamon, allspice, cloves, cardamom, black tea' },
            { nameRu: 'Малиновый', nameEn: 'Raspberry', price: 30000, descriptionRu: 'Малина, черный чай, мята, гибискус', descriptionEn: 'Raspberry, black tea, mint, hibiscus' },
            { nameRu: 'Тропический чай', nameEn: 'Tropical tea', price: 44000, descriptionRu: 'Апельсин, клубника, лимон, сироп банан, сироп маракуйя, черный чай', descriptionEn: 'Orange, strawberry, lemon, banana syrup, passion fruit syrup, black tea' },
            { nameRu: 'Чай в ассортименте', nameEn: 'Tea in assortment', price: 15000, descriptionRu: 'Зеленый чай, черный чай, чай с жасмином, травяной чай', descriptionEn: 'Green tea, black tea, tea with jasmine, herbal tea' },
        ],
    },
    {
        nameRu: 'Кофе',
        nameEn: 'Coffee',
        sortOrder: 11,
        items: [
            { nameRu: 'Эспрессо', nameEn: 'Espresso', price: 25000 },
            { nameRu: 'Дабл эспрессо', nameEn: 'Double espresso', price: 35000 },
            { nameRu: 'Американо', nameEn: 'Americano', price: 35000 },
            { nameRu: 'Капучино', nameEn: 'Cappuccino', price: 40000 },
            { nameRu: 'Латте', nameEn: 'Latte', price: 40000 },
        ],
    },
];
async function seedMenuCategories(menuId, menuTypeCode, categories) {
    const menuType = await prisma.menuType.findFirst({
        where: { menuId, code: menuTypeCode },
    });
    if (!menuType)
        throw new Error(`MenuType ${menuTypeCode} not found`);
    await prisma.category.deleteMany({ where: { menuTypeId: menuType.id } });
    for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const translations = [
            { locale: 'ru', name: cat.nameRu },
            ...(cat.nameEn ? [{ locale: 'en', name: cat.nameEn }] : []),
        ];
        await prisma.category.create({
            data: {
                menuTypeId: menuType.id,
                sortOrder: cat.sortOrder,
                translations: {
                    create: translations.map((t) => ({ locale: t.locale, name: t.name })),
                },
                menuItems: cat.items.length > 0
                    ? {
                        create: cat.items.map((item, idx) => ({
                            price: item.price,
                            weightOrVolume: item.weightOrVolume ?? null,
                            sortOrder: idx,
                            translations: {
                                create: [
                                    { locale: 'ru', name: item.nameRu, description: item.descriptionRu ?? null },
                                    ...(item.nameEn
                                        ? [{ locale: 'en', name: item.nameEn, description: (item.descriptionEn ?? item.descriptionRu) ?? null }]
                                        : [{ locale: 'en', name: item.nameRu, description: (item.descriptionEn ?? item.descriptionRu) ?? null }]),
                                ],
                            },
                        })),
                    }
                    : undefined,
            },
        });
    }
}
const SEED_RESTAURANT_ID = 'cm_seed_restaurant';
const SEED_MENU_ID = 'cm_seed_menu_default';
async function main() {
    for (const lang of LANGUAGES) {
        await prisma.language.upsert({
            where: { code: lang.code },
            create: lang,
            update: lang,
        });
    }
    const restaurant = await prisma.restaurant.upsert({
        where: { id: SEED_RESTAURANT_ID },
        create: {
            id: SEED_RESTAURANT_ID,
            name: 'DMR — Digital Menu Restaurant',
            slug: 'default',
        },
        update: { name: 'DMR — Digital Menu Restaurant' },
    });
    const menu = await prisma.menu.upsert({
        where: { id: SEED_MENU_ID },
        create: {
            id: SEED_MENU_ID,
            restaurantId: restaurant.id,
            name: 'Основное меню',
            sortOrder: 0,
            isActive: true,
        },
        update: {},
    });
    await prisma.restaurantDomain.upsert({
        where: { host: 'localhost' },
        create: { host: 'localhost', restaurantId: restaurant.id },
        update: { restaurantId: restaurant.id },
    });
    await prisma.siteSettings.upsert({
        where: { restaurantId: restaurant.id },
        create: { restaurantId: restaurant.id },
        update: {},
    });
    for (const mt of MENU_TYPES) {
        const created = await prisma.menuType.upsert({
            where: {
                menuId_code: { menuId: menu.id, code: mt.code },
            },
            create: {
                menuId: menu.id,
                code: mt.code,
                sortOrder: mt.sortOrder,
            },
            update: { sortOrder: mt.sortOrder },
        });
        for (const [locale, name] of Object.entries(mt.names)) {
            await prisma.menuTypeTranslation.upsert({
                where: { menuTypeId_locale: { menuTypeId: created.id, locale } },
                create: { menuTypeId: created.id, locale, name },
                update: { name },
            });
        }
    }
    await seedMenuCategories(menu.id, 'main', MAIN_MENU_CATEGORIES);
    await seedMenuCategories(menu.id, 'bar', BAR_MENU_CATEGORIES);
    const adminEmail = 'admin@demo.local';
    let user = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!user) {
        const hash = await bcrypt.hash('admin123', 10);
        user = await prisma.user.create({
            data: { email: adminEmail, passwordHash: hash },
        });
        console.log('Admin user created: admin@demo.local / admin123');
    }
    await prisma.userRestaurant.upsert({
        where: {
            userId_restaurantId: { userId: user.id, restaurantId: restaurant.id },
        },
        create: {
            userId: user.id,
            restaurantId: restaurant.id,
            role: 'OWNER',
        },
        update: { role: 'OWNER' },
    });
    console.log('Seed completed.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map