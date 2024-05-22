import type {LayoutServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";


export const load: LayoutServerLoad = (event) => {
    if (!event.locals.user) redirect(302, "/");

    return {
        user: event.locals.user
    };
};


