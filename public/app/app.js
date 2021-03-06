'use strict';
/*************************** Views **************************\/**/
import { MenuView }    from './views/menu.js';                /**/
import { PlayView }    from './views/play.js';                /**/
import { AboutView }   from './views/about.js';               /**/
import { LeadersView } from './views/leaders.js';             /**/
import { LoginView }   from './views/login.js';               /**/
import { SignUpView }  from './views/signup.js';              /**/
import { ProfileView } from './views/profile.js';             /**/
import { ChatView }    from './views/chat.js';                /**/
import { NotFoundView } from './views/notFound.js';           /**/
/************************* Services *************************\/**/
import { RegisterService }   from './services/register.js';   /**/
import { ProfileService }    from './services/profile.js';    /**/
import { AuthService }       from './services/auth.js';       /**/
import { ScoreboardService } from './services/scoreboard.js'; /**/
import { GameService }       from './services/game.js';       /**/
import { ChatService }       from './services/chat.js';       /**/
/************************** Others **************************\/**/
import { makeAvatarPath } from './modules/utils.js';          /**/
import { Router } from './modules/router.js';                 /**/
import { events } from './game/core/events.js';               /**/
import { GopherComponent } from './components/gopher/gopher.js';/**/
import bus from './modules/bus.js';                           /**/
import idb from './modules/indexdb.js';                       /**/
import '../assets/scss/main.scss';                            /**/
/************************************************************\/**/

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    if (document.requestFullscreen) {
        document.requestFullscreen();
    } else if (document.mozRequestFullScreen) { /* Firefox */
        document.mozRequestFullScreen();
    } else if (document.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        document.webkitRequestFullscreen();
    } else if (document.msRequestFullscreen) { /* IE/Edge */
        document.msRequestFullscreen();
    }
}

window.user = {
    nickname: 'guest',
    isAuthorised: AuthService.isAuthorised,
    id: AuthService.id
};

const gopher = new GopherComponent({
    customClasses: 'gopher-modal',
    mode: 'modal'
});
const app = document.getElementById('app');
app.insertAdjacentHTML('afterend', gopher.template);
gopher.startActing();

idb.get('user', user.id);
bus.on(`success:get-user-${user.id}`, (user) => {
    if (!user) {
        GameService.fillTestDB();
        return;
    }

    window.user.nickname = user.nickname;
});

bus.on('signup', (data) => {
    RegisterService.register(data)
        .then((response) => {
            AuthService.setAuthorised(response);
            router.open('/');
        })
        .catch(res => {
            if (res.status === 418 || !navigator.onLine) {
                bus.emit('error:sign-up', {error: 'Your are offline buddy'});
            } else {
                bus.emit('error:signup', res.data);
            }
        });
});

bus.on('check-validity-signup', (data) => {
    RegisterService.checkValidity(data)
        .then(() => bus.emit('success:check-validity-signup'))
        .catch(res => bus.emit('error:signup', res));
});

bus.on('login', (data) => {
    AuthService.auth(data)
        .then((response) => {
            AuthService.setAuthorised(response);
            router.open('/');
        })
        .catch(res => {
            if (res.status === 418 || !navigator.onLine) {
                bus.emit('error:login', {error: 'Your are offline buddy'});
            } else {
                bus.emit('error:login', res.data);
            }
        });
});

bus.on('check-validity-login', (data) => {
    AuthService.checkValidity(data)
        .then(() => bus.emit('success:check-validity-login'))
        .catch(res => bus.emit('error:login', res));
});

bus.on('get-profile', () => {
    ProfileService.getProfile()
        .then(profile => {
            profile.avatarPath = makeAvatarPath(profile.avatarPath);
            bus.emit('success:get-profile', profile);
        })
        .catch(error => {
            AuthService.removeAuthorised();
            if (error.status === 401) router.open('/login');
            else console.error('Error:', error);
        });
});

bus.on('update-profile', (data) => {
    ProfileService.updateProfile(data)
        .then(res => bus.emit('success:update-profile', makeAvatarPath(res.avatarPath)))
        .catch(res => bus.emit('error:update-profile', res.data));
});

bus.on('check-validity-profile', (data) => {
    ProfileService.checkValidity(data)
        .then(() => bus.emit('success:check-validity-profile'))
        .catch(res => bus.emit('error:update-profile', res));
});

bus.on('get-leaders', (page) => {
    ScoreboardService.getLeaders(page)
        .then(res => bus.emit('success:get-leaders', res))
        .catch(res => {
            if (res.status === 418 || !navigator.onLine) {
                bus.emit('error:get-leaders', 'Content is not available in offline mode');
            } else {
                console.error(res);
            }
        });
});

bus.on('logout', () => {
    AuthService.logout()
        .then(() => {
            AuthService.removeAuthorised();
            router.open('/');
        })
        .catch((err) => console.error(err));
});

bus.on('show-loader', () => {
    gopher.showModal();
    gopher.say('Подождите пожалуйста идёт загрузка', false, 75);
})
.on('hide-loader', () => gopher.hideModal() );

bus.on('check-indexedDB', GameService.checkDB);
bus.on(events.GO_TO_PAGE, (page) => router.open(page));

bus.on(events.WS_CONNECT, () => {
    const gameService = new GameService();
    bus.on('game:send-message', gameService.sendMessage);
    bus.on(events.WS_DISCONNECT, () => {
        bus.off('game:send-message', gameService.sendMessage);
    });
});

bus.on('created-chat', () => {
    const chatService = new ChatService();
    bus.on('chat:send-message', chatService.sendMessage);
});

const router = new Router(app);
router
    .register('/', MenuView)
    .register('/about', AboutView)
    .register('/menu', MenuView)
    .register('/leaders', LeadersView)
    .register('/login', LoginView)
    .register('/singleplayer', PlayView)
    .register('/multiplayer', PlayView)
    .register('/profile', ProfileView)
    .register('/signup', SignUpView)
    .register('/chat', ChatView)
    .register('/not-found', NotFoundView);

router
    .registerInAccess('/profile', false, '/login')
    .registerInAccess('/login', true, '/profile')
    .registerInAccess('/signup', true, '/profile');

router.start();

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js', { scope: '/' })
//         .then((registration) => {
//             if (registration.installing) {
//                 const data = {
//                     type: 'CACHE_URLS',
//                     payload: [
//                         location.href,
//                         ...performance.getEntriesByType('resource').map((r) => r.name)
//                     ]
//                 };
//                 registration.installing.postMessage(data);
//             }
//         })
//         .catch((err) => console.log('SW registration FAIL:', err));
// }
