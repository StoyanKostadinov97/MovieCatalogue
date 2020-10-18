import { saveUserInfo, setHeader } from './controllers/auth.js';
import { login, registerUser, logout } from './models/user.js';
import { create, update, getAll, get, close } from './models/events.js';


const app = Sammy("body", function () {
    this.use("Handlebars", "hbs");

    //HEADER AND FOOTER
    const commonPartial = {
        header: './view/common/header.hbs',
        footer: './view/common/footer.hbs'
    }


    //HOME
    this.get('/', function (ctx) {
        setHeader(ctx);
        getAll().then(resp => {
            const movies = resp.docs.map(x => x = { ...x.data(), id: x.id });
            ctx.movies = movies;
            ctx.loadPartials(commonPartial).partial('./view/home.hbs');
        }).catch(e => alert(e.message));
    });
    this.get('#/home', function (ctx) {
        setHeader(ctx);
        getAll().then(resp => {
            const movies = resp.docs.map(x => x = { ...x.data(), id: x.id });
            ctx.movies = movies;
            ctx.loadPartials(commonPartial).partial('./view/home.hbs');
        }).catch(e => alert(e.message));
    });

    //LOGIN GET AND POST
    this.get('#/login', function (ctx) {
        ctx.loadPartials(commonPartial).partial('./view/user/login.hbs')
    });
    this.post('#/login', function (ctx) {
        const { email, password } = ctx.params;
        login(email, password)
            .then(resp => {
                saveUserInfo(resp.user.email);
                ctx.redirect('#/home');
            })
            .catch(e => alert(e.message));
    });


    //REGISTER GET AND POST
    this.get('#/register', function (ctx) {
        ctx.loadPartials(commonPartial).partial('./view/user/register.hbs')
    });
    this.post('#/register', function (ctx) {
        const { email, password, repeatPassword } = ctx.params;
        if (email.length === 0) {
            alert('The email input must be filled')
        };
        if (password.length < 6) {
            alert('The password should be at least 6 characters long')
        };
        if (password != repeatPassword) {
            alert("The repeat password should be equal to the password");
        };
        registerUser(email, password)
            .then(resp => {
                console.log(resp);
                saveUserInfo(resp.user.email);
                ctx.redirect('#/home');
            })
            .catch(e => console.log(e));
    });


    //LOGOUT GET
    this.get('#/logout', function (ctx) {
        logout().then(resp => {
            sessionStorage.clear();
            ctx.redirect('#/login');
        })
            .catch(e => console.log(e));
    });


    //CREATE GET AND POST
    this.get('#/create', function (ctx) {
        setHeader(ctx);
        ctx.loadPartials(commonPartial).partial('./view/events/create.hbs')
    });
    this.post('#/create', function (ctx) {
        const { title, description, imageUrl } = ctx.params;
        if (title.length == 0 || description.length == 0 || imageUrl.length == 0) {
            alert('Invalid inputs!')
        }
        const organizer = sessionStorage.getItem('user');

        create({ title, description, imageUrl, organizer, likes: 0 })
            .then(resp => {
                ctx.redirect('#/home');
            })
            .catch(e => console.log(e));
    });


    //DETAIL GET
    this.get('#/details/:id', function (ctx) {
        setHeader(ctx);
        const id = ctx.params.id;
        get(id)
            .then(resp => {
                ctx.movie = { ...resp.data(), id: resp.id };
                if (sessionStorage.likes !== undefined) {

                    if (sessionStorage.likes.includes(ctx.movie.title)) {
                        ctx.isLiked = true;
                        console.log(ctx.isLiked);
                    }

                }

                ctx.isOrganizer = ctx.movie.organizer === sessionStorage.getItem('user');
                ctx.loadPartials(commonPartial).partial('./view/events/details.hbs')
            })
            .catch(e => alert(e.message));
    });


    //EDIT GET AND POST
    this.get('#/edit/:id', function (ctx) {
        const id = ctx.params.id;
        get(id)
            .then(resp => {
                ctx.movie = { ...resp.data(), id: resp.id };
                ctx.loadPartials(commonPartial).partial('./view/events/edit.hbs')
            })
            .catch(e => console.log(e));

    });
    this.post('#/edit/:id', function (ctx) {
        const id = ctx.params.id;
        const { title, description, imageUrl } = ctx.params;
        update(id, { title, description, imageUrl })
            .then(resp => {
                ctx.redirect(`#/details/${id}`);
            });
    });


    //DELETE    
    this.get('#/delete/:id', function (ctx) {
        const id = ctx.params.id;
        close(id)
            .then(resp => {
                ctx.redirect('#/home');
            })
            .catch(e => console.log(e));
    });


    //UPDATE likes
    this.get('#/like/:id', function (ctx) {
        const id = ctx.params.id;
        get(id)
            .then(resp => {
                ctx.movie = resp.data();
                const likes = ctx.movie.likes + 1;
                sessionStorage.likes='';
                sessionStorage.likes+=`,${ctx.movie.title}`;
                
                update(id, { likes })
                    .then(() => {
                        ctx.redirect(`#/details/${id}`)
                    })
            })
            .catch(e => console.log(e));
    });









});
app.run('#/home');

