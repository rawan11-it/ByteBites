import { Recipe } from '../types';

export const initialRecipes: Recipe[] = [
  {
    id: 'machboos-chicken',
    title: 'كبسة دجاج بايت',
    titleEn: 'Byte Chicken Kabsa',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACRoDmmoEwjED53UZ7REO0AkEMBFtPJKj5TNShv6uXNTw_eTgqP1h1cqfcCdxD9ibIH68dAebNU4ft45JIAm1eTH0BKO9eGelKrUAqHncx-W008QyQBD_DRDEkr9iCj0Y09giCjL0qCfaJSR0sxUwo_qOu1A5XOb_tYEXQjWTZMwde8YePgQRXFK5NWdVAuOx-JxZZy3O6cnhoBuEYlU_JVUqqzDPprr0CMdtdlhwTEGuwG7nMdIEE',
    rating: 4.9,
    time: '45 دقيقة',
    timeEn: '45 mins',
    calories: '400 سعرة',
    caloriesEn: '400 kcal',
    difficulty: 'سهل',
    difficultyEn: 'Easy',
    servings: '4 أشخاص',
    servingsEn: '4 servings',
    category: 'غداء رئيسي',
    categoryEn: 'Main Course',
    protein: '35g',
    carbs: '12g',
    fat: '14g',
    ingredients: [
      'دجاجة كاملة (مقطعة 8 قطع)',
      '3 أكواب أرز بسمتي (منقوع ومغسول)',
      '2 بصلة كبيرة (مفرومة)',
      'بهارات كبسة سعودية (كمون، كزبرة، لومي أسود، قرفة، هيل)'
    ],
    ingredientsEn: [
      '1 Whole Chicken (cut into 8 pieces)',
      '3 Cups Basmati Rice (soaked and rinsed)',
      '2 Large Onions (finely chopped)',
      'Machboos Spices (cumin, coriander, dried lime, cinnamon)'
    ],
    instructions: [
      'في قدر كبير، سخني الزيت وضيفي البصل حتى يذبل ويصبح ذهبي اللون.',
      'أضيفي قطع الدجاج والبهارات وقلبي جيداً حتى يتغير لون الدجاج.',
      'اغمري الدجاج بالماء المغلي واتركيه على نار متوسطة لمدة 30 دقيقة أو حتى ينضج.'
    ],
    instructionsEn: [
      'In a large pot, heat the oil and saute onions until translucent and golden.',
      'Add chicken pieces and spices, stir-frying well until chicken changes color.',
      'Submerge chicken with boiling water and simmer on medium heat for 30 mins until tender.'
    ],
    aiTip: 'لا ترفع الحرارة كثير عشان ما ينشف الدجاج. خليه يطبخ على مهله عشان ياخذ النكهة الصح!',
    aiTipEn: "Don't raise the heat too high so the chicken stays tender and juicy. Let it simmer gently to absorb all authentic spices!"
  },
  {
    id: 'homemade-pizza',
    title: 'بيتزا منزلية',
    titleEn: 'Homemade Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    time: '20 د',
    timeEn: '20 mins',
    calories: '320 سعرة',
    caloriesEn: '320 kcal',
    difficulty: 'متوسط',
    difficultyEn: 'Medium',
    servings: '2 أشخاص',
    servingsEn: '2 servings',
    category: 'وجبة سريعة',
    categoryEn: 'Fast Meal',
    protein: '18g',
    carbs: '42g',
    fat: '11g',
    ingredients: [
      'عجينة بيتزا محضرة منزلياً',
      'صلصة طماطم بالريحان',
      'جبن موزاريلا طازج مبشور',
      'شرائح فلفل رومي وزيتون'
    ],
    ingredientsEn: [
      'Fresh homemade pizza dough',
      'Basil tomato sauce',
      'Fresh shredded mozzarella cheese',
      'Bell pepper slices and black olives'
    ],
    instructions: [
      'افردي العجينة على صينية مدهونة بزيت الزيتون.',
      'وزعي صلصة الطماطم بالتساوي ثم أضيفي الجبن والمكونات.',
      'اخبزيها في فرن ساخن على حرارة 220 مئوية لمدة 12-15 دقيقة.'
    ],
    instructionsEn: [
      'Roll out dough onto a pan drizzled with olive oil.',
      'Spread tomato sauce evenly, then top with mozzarella and fresh toppings.',
      'Bake in a preheated oven at 220°C (425°F) for 12-15 minutes until bubbly and golden.'
    ],
    aiTip: 'سر القرمشة هو تسخين صينية الفرن قبل وضع البيتزا عليها!',
    aiTipEn: 'The secret to a crispy crust is preheating the baking pan before placing the pizza on it!'
  },
  {
    id: 'green-salad',
    title: 'سلطة خضراء',
    titleEn: 'Green Salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    time: '10 د',
    timeEn: '10 mins',
    calories: '120 سعرة',
    caloriesEn: '120 kcal',
    difficulty: 'سهل جداً',
    difficultyEn: 'Very Easy',
    servings: '2 أشخاص',
    servingsEn: '2 servings',
    category: 'سلطات',
    categoryEn: 'Salads',
    protein: '4g',
    carbs: '9g',
    fat: '3g',
    ingredients: [
      'خس روماني طازج مقطع',
      'خيار وطماطم كرزية',
      'عصير ليمون وزيت زيتون بكر',
      'رشة سماق ونعناع مجفف'
    ],
    ingredientsEn: [
      'Fresh chopped romaine lettuce',
      'Crisp cucumbers & cherry tomatoes',
      'Fresh lemon juice & extra virgin olive oil',
      'Pinch of sumac and dried mint'
    ],
    instructions: [
      'اغسلي الخضار وجففيها جيداً ثم قطعيها.',
      'اخلطي زيت الزيتون مع الليمون والملح في وعاء صغير.',
      'اسكبي التتبيلة فوق الخضار وقلبي بلطف قبل التقديم مباشرة.'
    ],
    instructionsEn: [
      'Wash, dry, and chop the fresh greens.',
      'Whisk olive oil, lemon juice, and a pinch of sea salt in a bowl.',
      'Drizzle dressing over the greens and toss gently right before serving.'
    ],
    aiTip: 'ضيفي التتبيلة قبل التقديم مباشرة عشان تحافظ الأوراق على قرمشتها!',
    aiTipEn: 'Add the dressing right before serving so the crisp leaves stay vibrant and fresh!'
  },
  {
    id: 'chicken-kabsa',
    title: 'كبسة دجاج',
    titleEn: 'Chicken Kabsa',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    time: '45 د',
    timeEn: '45 mins',
    calories: '450 سعرة',
    caloriesEn: '450 kcal',
    difficulty: 'متوسط',
    difficultyEn: 'Medium',
    servings: '4 أشخاص',
    servingsEn: '4 servings',
    category: 'غداء رئيسي',
    categoryEn: 'Main Course',
    protein: '38g',
    carbs: '48g',
    fat: '16g',
    ingredients: [
      'قطع دجاج متبلة بالبهارات العربية',
      'أرز بسمتي طويل الحبة',
      'طماطم ومعجون طماطم',
      'مكسرات محمصة للتزيين'
    ],
    ingredientsEn: [
      'Chicken pieces seasoned with Arabic spices',
      'Long-grain Basmati rice',
      'Tomatoes and tomato paste',
      'Toasted nuts for garnish'
    ],
    instructions: [
      'شوحي الدجاج مع البصل والبهارات الصحيحة حتى يحمر.',
      'أضيفي الماء واطهي الدجاج حتى ينضج ثم حمري وجهه بالفرن.',
      'اطبخي الأرز في مرق الدجاج وقدميه مزيناً بالدجاج والمكسرات.'
    ],
    instructionsEn: [
      'Brown chicken pieces with onions and whole spices.',
      'Add broth and simmer until tender, then roast under broiler for crisp skin.',
      'Cook rice in the flavorful broth and serve topped with chicken and nuts.'
    ],
    aiTip: 'حمصي البهارات الصحيحة بالزيت قبل إضافة البصل لاستخراج أقصى نكهة عطرية!',
    aiTipEn: 'Toast whole spices in oil before adding onions to extract maximum aromatic aroma!'
  },
  {
    id: 'grilled-chicken-veg',
    title: 'دجاج مشوي مع الخضار',
    titleEn: 'Grilled Chicken with Vegetables',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrciS23qwazvd_x0kNZi86ZMZ7TyVOPkt8Fpz2XhtDYu3ubI9lnDDJDF4CdVNajqDt8ma1WwhqjNssZJYoQ4wjEaeNYpCM_iYB6OUL2XgJXmtQrhh4eqY6HQysy7GgrFY8MMrO6mrgwz-vc1_5NhXWXhtFW1Mm5MQIvUln1Iy3VQpNcdOFrAP5Pj3eAY3HohhpRDUSNrn3NSh62RTas-YxF0Q05mMmJ9x5XAF8a6mx_-RDAsedxgdy',
    rating: 4.8,
    time: '35 دقيقة',
    timeEn: '35 mins',
    calories: '310 سعرة',
    caloriesEn: '310 kcal',
    difficulty: 'سهل',
    difficultyEn: 'Easy',
    servings: '2 أشخاص',
    servingsEn: '2 servings',
    category: 'غداء صحي',
    categoryEn: 'Healthy Lunch',
    protein: '42g',
    carbs: '10g',
    fat: '8g',
    ingredients: [
      'صدور دجاج متبلة بالأعشاب والليمون',
      'كوسا وجزر وبروكلي مقطع',
      'فصوص ثوم وزيت زيتون',
      'أوريجانو وإكليل الجبل'
    ],
    ingredientsEn: [
      'Herb & lemon marinated chicken breasts',
      'Sliced zucchini, carrots, and broccoli',
      'Garlic cloves & olive oil',
      'Oregano and fresh rosemary'
    ],
    instructions: [
      'تبلي صدور الدجاج بزيت الزيتون والليمون وإكليل الجبل.',
      'رصي الخضار والدجاج في صينية فرن مبطنة بورق زبدة.',
      'اشوي الصينية على حرارة 200 مئوية لمدة 25-30 دقيقة.'
    ],
    instructionsEn: [
      'Marinate chicken breasts with olive oil, lemon zest, and rosemary.',
      'Arrange chicken and seasoned vegetables on a lined baking tray.',
      'Roast in oven at 200°C for 25-30 mins until cooked through and nicely browned.'
    ],
    aiTip: 'تبلي الخضار بنفس تتبيلة الدجاج لتوحيد النكهات الغنية!',
    aiTipEn: 'Toss vegetables in the same marinade as chicken to harmonize all gourmet flavors!'
  },
  {
    id: 'quinoa-salad',
    title: 'سلطة الكينوا المنعشة',
    titleEn: 'Refreshing Quinoa Salad',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5J8RqXdUUhTcthM_hLm3HjLnsbJ7zSH5DvRJufOshi-LkMXHRqoFkNLxZU6jVIv80dt472sqlhwoDxyn5fCc3FoaurP4gty7TlrJXZa6JK3Oa2KZuOrgz0WiPPmZo-qjHc3Je1yNJrXAwrLBK2jjzkYIVtJInlR-jl5UXxFPymy9sa_GWIldfdv7ez94U2rwMiIuEPYyIdIjnGlSYZYxSKh4gkN56j8IQVKNEiSi-8Qykkk8WYAVn',
    rating: 4.7,
    time: '15 دقيقة',
    timeEn: '15 mins',
    calories: '220 سعرة',
    caloriesEn: '220 kcal',
    difficulty: 'سهل',
    difficultyEn: 'Easy',
    servings: '2 أشخاص',
    servingsEn: '2 servings',
    category: 'نباتي',
    categoryEn: 'Vegetarian',
    protein: '8g',
    carbs: '28g',
    fat: '7g',
    ingredients: [
      'كوب كينوا مسلوقة ومبردة',
      'خيار وطماطم كرزية وبصل أحمر',
      'جبن فيتا قليل الدسم',
      'تتبيلة الليمون والنعناع'
    ],
    ingredientsEn: [
      '1 cup cooked and chilled quinoa',
      'Cucumber, cherry tomatoes, and red onion',
      'Crumbled low-fat feta cheese',
      'Lemon-mint vinaigrette'
    ],
    instructions: [
      'اسلقي الكينوا بالماء المملح واتركيها لتبرد تماماً.',
      'قطعي الخضار واخلطيها مع الكينوا في وعاء التقديم.',
      'أضيفي التتبيلة وزيني السطح بجبن الفيتا والنعناع.'
    ],
    instructionsEn: [
      'Cook quinoa in salted water, fluff, and allow to cool.',
      'Chop fresh vegetables and combine with quinoa in a salad bowl.',
      'Drizzle with vinaigrette and garnish with feta cheese and mint.'
    ],
    aiTip: 'اغسلي الكينوا جيداً قبل السلق لإزالة أي مرارة طبيعية!',
    aiTipEn: 'Rinse quinoa thoroughly under cold water before cooking to remove natural saponin!'
  },
  {
    id: 'tomato-soup',
    title: 'شوربة الطماطم الكلاسيكية',
    titleEn: 'Classic Tomato Soup',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJor7UZs4LeFf9a0v2oUGQNcngvH4XOrIBhI_D8H_ZA1pLsOrconFZAVp5bOFtIvd7bX72HJ7kdIhuIRMtLgx0fMKWp3gSEXK_A4Ou6M3sSWV1wd8BcHGGXPEsluZJzh4V0QQQI1n8QlYgJAU9Pfi_gVpY4J-ncddfRybulHv5kHL-o5satw2LDgPz7NiW2cfUzeUmrnllfKSygtRMn-lJZR3iA4_fuNLsXuJvqiuGwmY63Q1rbbDT',
    rating: 4.8,
    time: '25 دقيقة',
    timeEn: '25 mins',
    calories: '180 سعرة',
    caloriesEn: '180 kcal',
    difficulty: 'سهل',
    difficultyEn: 'Easy',
    servings: '3 أشخاص',
    servingsEn: '3 servings',
    category: 'عشاء خفيف',
    categoryEn: 'Light Dinner',
    protein: '5g',
    carbs: '22g',
    fat: '6g',
    ingredients: [
      'طماطم ناضجة مشوية بالفرن',
      'بصل وثوم وأوراق ريحان طازجة',
      'مرق خضار أو دجاج',
      'ملعقة كريمة طبخ خفيفة'
    ],
    ingredientsEn: [
      'Oven-roasted ripe tomatoes',
      'Onions, garlic, and fresh basil leaves',
      'Vegetable or chicken stock',
      'Splash of light cooking cream'
    ],
    instructions: [
      'اشوي الطماطم مع الثوم والبصل حتى تتكرمل.',
      'اطحني المكونات في الخلاط مع المرق وأوراق الريحان.',
      'سخني الشوربة في قدر وأضيفي لمسة كريمة قبل التقديم.'
    ],
    instructionsEn: [
      'Roast tomatoes with garlic and onions until caramelized.',
      'Blend roasted ingredients smoothly with hot broth and fresh basil.',
      'Warm in a pot, season to taste, and finish with a swirl of light cream.'
    ],
    aiTip: 'شوي الطماطم بالفرن يضاعف حلاوتها الطبيعية ويعطي الشوربة عمقاً لذيذاً!',
    aiTipEn: 'Roasting tomatoes concentrates their natural sweetness and gives the soup incredible depth!'
  }
];
