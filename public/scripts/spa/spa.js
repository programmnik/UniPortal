import Dashboard from './views/Dashboard.js';
import Materials from './views/Materials.js';
import Calendar from './views/Calendar.js';
import Schedule from './views/Schedule.js';
import Chat from './views/Chat.js';
import Journal from './views/Journal.js';
import Information from './views/Information.js';
import Profile from './views/Profile.js';
import routes from '../../roots/roots.json' with { type: 'json' };

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = match => {
    const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    //Test each route for potantion match
    const potantialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        }
    });

    let match = potantialMatches.find(potantialMatch => potantialMatch.result !== null);

    if (!match) match = { route: routes[0], result: [location.pathname] };

    
    // const view = new match.route.view(getParams(match));

    // document.querySelector("#app").innerHTML = await view.getHtml();
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", e => {
        let target = e.target;
        while (target && target !== document) {
            if (target.matches("[data-link]")) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                navigateTo(target.href);
                return false;
            }
            target = target.parentElement;
        }
    }, true); 
});

