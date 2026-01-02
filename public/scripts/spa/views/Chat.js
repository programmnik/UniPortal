import AbstractView from './AbstractView.js';
import routes from '../../../roots/roots.json' with { type: 'json' };

const correntView = routes.find(route => route.view === 'Chat');

export default class extends AbstractView{
    constructor(params){
        super(params);
        this.setTitle(`UniPortal - ${correntView.variables.title}`);
    }

    async getHtml(){
        return "";
    }
}