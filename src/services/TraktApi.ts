import axios from 'axios';
import Movie from '@/models/Movie';
import Ids from '@/models/Ids';

export default class TraktApi {
    private baseUrlTrakt = 'https://api.trakt.tv'; // todo cleanup globals
    private traktClientKey = process.env.VUE_APP_TRAKT_CLIENT_ID as string;
    private traktApiVersion = 2;
    private timeout = 10000;
    private traktInstance = axios.create({ // todo singleton
        baseURL: this.baseUrlTrakt,
        timeout: this.timeout,
        headers: {
            'Content-type': 'application/json',
            'trakt-api-key': this.traktClientKey,
            'trakt-api-version': this.traktApiVersion,
        },
    });

    public async getMoviesPopular(): Promise<Movie[]> {
        const resultMovies = (await this.traktInstance.get('/movies/popular')).data;

        // convert to Movie objects
        const movies: Movie[] = [];
        for (const resMov of resultMovies) { // todo make it use the convertToMovies method
            const newIds = new Ids(resMov.ids.trakt, resMov.ids.slug, resMov.ids.imdb, resMov.ids.tmdb);
            movies.push(new Movie(resMov.title, resMov.year, newIds));
        }
        return movies;
    }

    public async getMoviesTrending(): Promise<Movie[]> {
        const resultMovies = (await this.traktInstance.get('/movies/trending')).data;
        return TraktApi.convertToMovies(resultMovies);
    }

    public async getMoviesAnticipated(): Promise<Movie[]> {
        const resultMovies = (await this.traktInstance.get('/movies/anticipated')).data;
        return TraktApi.convertToMovies(resultMovies);

    }

    public async getMoviesGrossingBoxOffice(): Promise<Movie[]> {
        const resultMovies = (await this.traktInstance.get('/movies/boxoffice')).data;
        return TraktApi.convertToMovies(resultMovies);

    }

    private static convertToMovies(resultMovies: any) {
        /** Converts from a basic (NOT extended) Movie JSON list to Movie array*/
        const movies: Movie[] = [];
        for (const resMov of resultMovies) {
            const movData = resMov.movie;
            const newIds = new Ids(movData.ids.trakt, movData.ids.slug, movData.ids.imdb, movData.ids.tmdb);
            movies.push(new Movie(movData.title, movData.year, newIds));
        }
        return movies;
    }

}
