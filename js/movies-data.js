/* Sample movie data for dynamic rendering. Add more entries as needed. */
const MOVIES = [
  {
    id: '1',
    title: 'Return to Zeist',
    year: 1991,
    rating: 4.7,
    duration: '100 min',
    ratingType: 'TV-MA',
    description: 'In the year 2024, the ozone layer is believed to have been destroyed, and it’s up to MacLeod and Ramirez to set things right. Opposition comes from both the planet Zeist and a corporation profiting from the supposed lack of ozone.',
    poster: '../img/movies/poster1.jpg',
    trailerThumb: '../img/hero/pack 1/hero.jpg',
    gallery: ['../img/movies/gallery1.jpg','../img/movies/gallery2.jpg','../img/movies/gallery3.jpg'],
    priceBuy: 12.4,
    priceRent: 2.4
  },
  {
    id: '2',
    title: 'Example Two',
    year: 2020,
    rating: 3.9,
    duration: '95 min',
    ratingType: 'PG-13',
    description: 'Second sample movie description.',
    poster: '../img/movies/poster2.jpg',
    trailerThumb: '../img/hero/pack 2/hero.jpg',
    gallery: [],
    priceBuy: 9.99,
    priceRent: 1.99
  }
];

function getMovieById(id){
  return MOVIES.find(m => String(m.id) === String(id));
}
