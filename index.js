const jsdom = require('jsdom');
const path = require('path');
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

async function singlelist(url) {

    let response = await axios(`https://www3.gogoanime.cm//search.html?keyword=${url}`)

    if (response.status === 200) {
        console.log('YES');
        return response.data;
    }
    else {
        console.log("NO")
        return 1;
    }
}

async function showepisode(url) {

    let response = await axios(`https://www3.gogoanime.cm/category/${url}`)

    if (response.status === 200) {
        console.log('YES');
        return response.data;
    }
    else {
        console.log("NO")
        return 1;
    }
}

async function showepisodes(start, end, id, title)
{
    let response = await axios(`https://ajax.gogo-load.com/ajax/load-list-episode?ep_start=${start}&ep_end=${end}&id=${id}&default_ep=0&alias=${title}`)
    if (response.status === 200) {
        console.log('YES');
        return response.data;
    }
    else {
        console.log("NO")
        return 1;
    }
}

const scrapelink = (pattern) =>
{
    const movie = {
      name : pattern.querySelector('.name').getElementsByTagName('A')[0].textContent,
      link : "https://www3.gogoanime.cm" + pattern.getElementsByTagName('A')[0].href,
      }
    console.log(movie.name, movie.link);
    return movie;
}

const scrape = (pattern) =>
{
    const movie = {
      name : pattern.querySelector('.name').getElementsByTagName('A')[0].textContent,
      link : pattern.querySelector('.img').getElementsByTagName('A')[0].href,
       img : pattern.querySelector('.img').getElementsByTagName('A')[0].getElementsByTagName('IMG')[0].getAttribute('src')
      }
    console.log(movie.name, movie.link);
    return movie;
}

app.get('/', (req, res) =>
{
    try{
    
    }catch(e)
    {
        console.log('FATAL ERROR')
    }
})

app.get('/search/:name', (req, res) =>
{
    const {name} = req.params;
    singlelist(name)
    .then(r =>
        {
            const dom = new jsdom.JSDOM(r);
            const show = dom.window.document.querySelector('ul.items');
            const rap = show.getElementsByTagName('LI');
            const arp = [];
            for (const rip of rap) {
                arp.push(scrape(rip));
            }
            res.render('index.ejs' , {arp:arp});
        })
})

app.get('/category/:name', (req, res) =>
{
    const {name} = req.params;
    showepisode(name)
    .then((r) =>
    {
        const dom = new jsdom.JSDOM(r);
        const show = dom.window.document.querySelector('#episode_page');
        const shop = dom.window.document.querySelector('.anime_info_episodes_next');
        const id = shop.querySelector('input').value;
        console.log(id);
        
        const rap = show.getElementsByTagName('LI'); 
        const end = rap[rap.length - 1].getElementsByTagName('A')[0].getAttribute('ep_end');
        console.log(end);
        res.redirect(`/cat/${1}/${end}/${id}/${name}`)
        
        
    })
})

app.get('/cat/:start/:end/:id/:title', (req, res)=>
{
    const {start, end, id, title } = req.params;
    console.log(start)
    console.log(end)
    console.log(id)
    console.log(title)
    //showepisodes(1, 50, 1089, 'naruto').then((r) =>

    showepisodes(start, end, id, title).then((r) =>
    {
        const dom = new jsdom.JSDOM(r);
        const epis = [];
        //console.log(r);
        const rap = dom.window.document.querySelectorAll('li'); 
        for (const rip of rap) {
            epis.push(rip.querySelector('a').href);
        }
        res.render('episodes', {episodes:epis});
    })
})

app.get('/:comp', (req, res) =>
{
    const {comp} = req.params;
    axios(`https://www3.gogoanime.cm/${comp}`).then((r) =>
    {
        //console.log(r.data);
        //res.send(r.data);
        const dom = new jsdom.JSDOM(r.data);
        let download = dom.window.document.querySelector('.dowloads').getElementsByTagName('A')[0].href;
        console.log(download);
        console.log('OUTSIDE');
        res.redirect(download);
    })
    
    
})

app.listen(process.env.PORT || 3000, () =>
{
    console.log('LISTENING AT PORT 3000')
    
})