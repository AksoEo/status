const reqJs = document.querySelector('#requires-javascript');
reqJs.parentNode.removeChild(reqJs);

const STRINGS = {
    loading: 'Ŝargas…',
    up: 'OK',
    down: 'Eraro',
    uptime: t => `Vivdaŭro: ${t}`,
    details: 'Pli da informoj →',
    lastChecked: t => `Laste kontrolita antaŭ ${t}`,
    downSince: t => `Nealirebla dum ${t}`,
    relTime: {
        seconds: n => `${n} sekundo${n === 1 ? '' : 'j'}`,
        minutes: n => `${n} minuto${n === 1 ? '' : 'j'}`,
        hours: n => `${n} horo${n === 1 ? '' : 'j'}`,
        days: n => `${n} tago${n === 1 ? '' : 'j'}`,
    },
};

function fmtRelTime(seconds) {
    if (seconds < 60) return STRINGS.relTime.seconds(seconds);
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return STRINGS.relTime.minutes(minutes);
    const hours = Math.round(minutes / 60);
    if (hours < 24) return STRINGS.relTime.hours(hours);
    const days = Math.round(hours / 24);
    return STRINGS.relTime.days(days);
}

const apiKey = 'ro-kXqeKYr784sTAoyEazbw';
let renderedChecks = null;

function renderChecks(checks) {
    if (renderedChecks) {
        renderedChecks.parentNode.removeChild(renderedChecks);
    }
    const ul = renderedChecks = document.createElement('ul');
    ul.className = 'status-checks';
    for (const item of checks) {
        if (!item.enabled) continue;
        const li = document.createElement('li');
        const up = !item.down && item.ssl.valid;
        li.dataset.up = up;

        {
            const title = document.createElement('h2');
            {
                const statusLabel = document.createElement('div');
                statusLabel.className = 'status-label';
                statusLabel.textContent = up ? STRINGS.up : STRINGS.down;
                title.appendChild(statusLabel);
            }
            const titleLabel = document.createElement('span');
            titleLabel.className = 'title-label';
            titleLabel.textContent = item.alias || item.url;
            title.appendChild(titleLabel);
            li.appendChild(title);
        }

        {
            const uptime = document.createElement('div');
            uptime.className = 'uptime';
            uptime.textContent = STRINGS.uptime(Math.round(item.uptime) + '%');
            li.appendChild(uptime);
        }

        if (item.last_check_at) {
            const lastChecked = document.createElement('div');
            lastChecked.className = 'last-checked';
            const seconds = Math.round(((+new Date()) - (+new Date(item.last_check_at))) / 1000);
            lastChecked.textContent = STRINGS.lastChecked(fmtRelTime(seconds));
            li.appendChild(lastChecked);
        }
        if (item.down_since) {
            const downSince = document.createElement('div');
            downSince.className = 'down-since';

            const seconds = Math.round(((+new Date()) - (+new Date(item.down_since))) / 1000);

            downSince.textContent = STRINGS.downSince(fmtRelTime(seconds));
            li.appendChild(downSince);
        }

        if (item.published) {
            const link = document.createElement('a');
            link.className = 'details-link';
            link.href = 'https://updown.io/' + item.token;
            link.textContent = STRINGS.details;
            link.rel = 'nofollow noreferrer noopener';
            li.appendChild(link);
        }

        ul.appendChild(li);
    }
    document.body.appendChild(ul);
}

function fetchChecks() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = STRINGS.loading;
    document.body.appendChild(loading);

    fetch('https://updown.io/api/checks?api-key=' + apiKey).then(result => {
        if (result.ok) {
            return result.json();
        } else {
            throw new Error(result.statusText);
        }
    }).then(checks => {
        document.body.removeChild(loading);
        renderChecks(checks);
    }).catch(error => {
        document.body.removeChild(loading);
        const label = document.createElement('div');
        label.textContent = error.toString();
        label.className = 'error';
        document.body.appendChild(label);
    });
}

fetchChecks();
