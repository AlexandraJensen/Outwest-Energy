(function(){
    var hdr=document.getElementById('hdr'),nav=document.getElementById('nav'),tog=document.getElementById('mobTog');

    /* Detect current page */
    var path=window.location.pathname;
    var page='home';
    if(path.indexOf('about')!==-1)page='about';
    else if(path.indexOf('careers')!==-1)page='careers';
    else if(path.indexOf('contact')!==-1)page='contact';
    else if(path.indexOf('news')!==-1)page='news';
    else if(path.indexOf('privacy')!==-1)page='privacy';
    else if(path.indexOf('terms')!==-1)page='terms';

    /* Active nav highlighting */
    var navLinks=nav.querySelectorAll('a');
    navLinks.forEach(function(a){
        var href=a.getAttribute('href')||'';
        if(page==='home'&&(href==='index.html'||href==='./'))a.classList.add('act');
        else if(href.indexOf(page)!==-1&&page!=='home')a.classList.add('act');
    });

    /* Header scroll */
    var isHome=page==='home';
    function updateHeader(){
        if(isHome&&window.scrollY<=80){hdr.classList.add('at-top');hdr.classList.remove('scrolled')}
        else{hdr.classList.remove('at-top');hdr.classList.add('scrolled')}
    }
    window.addEventListener('scroll',updateHeader,{passive:true});
    updateHeader();

    /* Mobile toggle */
    tog.addEventListener('click',function(){tog.classList.toggle('on');nav.classList.toggle('open')});

    /* Accordion */
    document.addEventListener('click',function(e){var t=e.target.closest('.acc-t');if(!t)return;var i=t.closest('.acc-i'),w=i.classList.contains('open');i.parentElement.querySelectorAll('.acc-i').forEach(function(x){x.classList.remove('open')});if(!w)i.classList.add('open')});

    /* Scroll-triggered reveals */
    var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting){
                entry.target.classList.add('vis');
                observer.unobserve(entry.target);
            }
        });
    },{threshold:0.1,rootMargin:'0px 0px -60px 0px'});
    document.querySelectorAll('.rv').forEach(function(el){observer.observe(el)});

    /* ═══ NEWS PAGE FUNCTIONALITY ═══ */
    if(page!=='news')return;

    var feedCache={};
    var tickerLoaded=false;

    /* Static fallback data */
    var FALLBACK={
        'canadian-energy':[
            {title:'Shell, Mitsubishi Exploring Sale Options for Stakes in LNG Canada',link:'https://boereport.com',pubDate:'2026-01-16',description:'Oil major Shell and Japanese conglomerate Mitsubishi are exploring sale options for their respective stakes in the C$40 billion LNG Canada project as owners weigh a potential expansion.',source:'BOE Report'},
            {title:'Enverus Releases 2026 Global Energy Outlook Highlighting Commodity Price Pressure',link:'https://energynow.ca',pubDate:'2026-01-28',description:'New outlook highlights increasing strain on power systems and geopolitical shifts in oil markets heading into 2026.',source:'EnergyNow'},
            {title:'Cenovus Energy Expects Upstream Production to Rise 4% in 2026',link:'https://oilprice.com',pubDate:'2026-01-15',description:'Canadian major sees upstream production between 945,000 and 985,000 boe/d next year following MEG Energy acquisition.',source:'OilPrice'},
            {title:'Canada Eyes Asia for Incremental LPG Exports as Infrastructure Race Heats Up',link:'https://spglobal.com',pubDate:'2026-01-10',description:'Multiple projects underway along the Pacific Coast in British Columbia will position Canada as a reliable long-term North American supplier.',source:'S&P Global'},
            {title:'Canadian Oil Production Set to Grow 3.5% in 2026 Despite Pipeline Constraints',link:'https://boereport.com',pubDate:'2026-01-08',description:'Production growth faces emerging pipeline egress constraints that could appear as early as Q1, increasing risk of wider differentials.',source:'Plainview Energy'},
            {title:'Suncor Energy Sees Annual Upstream Production of 840,000-870,000 bpd in 2026',link:'https://boereport.com',pubDate:'2026-01-12',description:'Production up by more than 100,000 barrels per day as expanded Trans Mountain pipeline increases takeaway capacity.',source:'BOE Report'},
            {title:'Gibson Energy Confirms 2025 Fourth Quarter Earnings Release Date',link:'https://energynow.ca',pubDate:'2026-01-20',description:'Gibson Energy provides conference call and webcast details for upcoming fourth quarter and year-end results.',source:'EnergyNow'},
            {title:'Federal EOR Incentives Could Accelerate Carbon Capture Project Development',link:'https://dobenergy.com',pubDate:'2026-02-02',description:'Enhanced oil recovery will not solve all cost challenges related to CCUS, but new federal incentives could accelerate project timelines.',source:'DOB Energy'},
            {title:'Headwater Exploration Announces 2025 Reserves and Fourth Quarter Results',link:'https://boereport.com',pubDate:'2026-01-15',description:'Company provides production results and operations update alongside year-end reserves report.',source:'BOE Report'}
        ],
        'wcsb-alberta':[
            {title:'Alberta Crown Land Sale Totals $15.1 Million in First Sale of 2026',link:'https://boereport.com',pubDate:'2026-01-15',description:'First land sale of the year starts strong with solid interest across the Western Canadian Sedimentary Basin.',source:'BOE Report'},
            {title:'CNRL Reportedly in Talks to Acquire Tourmaline Peace River High Assets',link:'https://boereport.com',pubDate:'2026-01-14',description:'Report suggests Canadian Natural Resources is negotiating acquisition of Tourmaline Oil assets in the Peace River region.',source:'BOE Report'},
            {title:'Shell Canada Production Jumps in November as LNG Canada Ramps Up',link:'https://boereport.com',pubDate:'2026-01-09',description:'Production increases signal ongoing ramp-up at the LNG Canada facility in Kitimat, British Columbia.',source:'BOE Report'},
            {title:'Alberta-Canada Energy Agreement Could Unlock $90 Billion in Low-Carbon Investment',link:'https://canadianenergycentre.ca',pubDate:'2026-01-05',description:'Policy think tank Clean Prosperity estimates the $130-per-tonne carbon credit price could drive massive investment including carbon capture and storage.',source:'Canadian Energy Centre'},
            {title:'Alberta Data Centre Investment Expected to Advance in 2026',link:'https://canadianenergycentre.ca',pubDate:'2026-01-05',description:'Interest is strong with proposed data centres requesting more than 20 gigawatts of power according to the Alberta Electric System Operator.',source:'Canadian Energy Centre'},
            {title:'Top Well Report: Whitecap Montney on Top, ARC Resources Most Represented',link:'https://boereport.com',pubDate:'2026-01-13',description:'November volumes show Whitecap leading Montney production while Ovintiv wells approach 40 mmcf/d.',source:'BOE Report'},
            {title:'Ksi Lisims LNG Project Referred for Fast-Tracking by Major Projects Office',link:'https://boereport.com',pubDate:'2026-01-06',description:'The 12-million-tonne-per-year project, a partnership with the Nisga\'a Nation, targets startup in 2029.',source:'BOE Report'},
            {title:'Alberta Pipeline Application to Northwest Coast Expected by July 2026',link:'https://canadianenergycentre.ca',pubDate:'2026-01-05',description:'Project designated in the national interest targeting a deep-water port for oil exports to Asian markets with Indigenous ownership opportunities.',source:'Canadian Energy Centre'},
            {title:'Alberta and Saskatchewan Crown Land Sale Year in Review 2025',link:'https://boereport.com',pubDate:'2026-01-07',description:'Annual review shows activity across the Western Canadian Sedimentary Basin as operators position for 2026 programs.',source:'BOE Report'}
        ],
        'deals':[
            {title:'Mitsubishi to Take Over Texas and Louisiana Shale Gas Assets for $7.53 Billion',link:'https://boereport.com',pubDate:'2026-01-15',description:'Major acquisition signals continued appetite for North American natural gas assets amid growing LNG export demand.',source:'BOE Report'},
            {title:'CNRL Reportedly in Talks to Acquire Tourmaline Peace River High Assets',link:'https://boereport.com',pubDate:'2026-01-14',description:'Canadian Natural Resources negotiating for Tourmaline Oil assets in the Peace River High area of northwestern Alberta.',source:'BOE Report'},
            {title:'Shell, Mitsubishi Exploring Sale Options for LNG Canada Stakes',link:'https://boereport.com',pubDate:'2026-01-16',description:'Moves come as owners of the C$40 billion LNG facility weigh potential expansion after another stakeholder, Petronas, explored options.',source:'Reuters'},
            {title:'Cenovus Completes MEG Energy Acquisition, Targets Production Growth',link:'https://oilprice.com',pubDate:'2026-01-11',description:'Integration of MEG Energy assets expected to drive 4% upstream production growth in 2026.',source:'OilPrice'},
            {title:'Harold Hamm Set to Halt Bakken Drilling as Margins Disappear',link:'https://boereport.com',pubDate:'2026-01-16',description:'Continental Resources founder signals pullback from Bakken operations citing compressed margins in current price environment.',source:'Bloomberg'},
            {title:'UK North Sea M&A Spree Continues into 2026',link:'https://oilprice.com',pubDate:'2026-01-14',description:'Consolidation wave in the North Sea accelerates as operators seek scale advantages amid cost pressures.',source:'OilPrice'},
            {title:'Two European Companies Announce $1.26 Billion Alberta Data Centre Plan',link:'https://canadianenergycentre.ca',pubDate:'2025-12-18',description:'Plan includes four new AI-ready data centres in Alberta, leveraging the province\'s energy infrastructure.',source:'Canadian Energy Centre'},
            {title:'Tuktu Resources Announces Results of Special Meeting of Shareholders',link:'https://boereport.com',pubDate:'2026-01-16',description:'Shareholders vote on key corporate actions at special meeting.',source:'BOE Report'},
            {title:'AltaGas Unveils Opti 1 Expansion at Ridley Island Energy Export Facility',link:'https://spglobal.com',pubDate:'2026-01-08',description:'First in a series of optimizations to add 25,000 b/d of throughput at the purpose-built LPG terminal in British Columbia.',source:'S&P Global'}
        ],
        'commodity':[
            {title:'Deloitte Cuts WTI Forecast to $58/bbl, Warns of Biggest Glut Since COVID',link:'https://ca.finance.yahoo.com',pubDate:'2026-01-22',description:'Global oil production expected to keep rising even after investment in oil and gas fell in 2025 for the first time in five years.',source:'Financial Post'},
            {title:'Discount on Western Canada Select Narrows',link:'https://boereport.com',pubDate:'2026-01-15',description:'WCS differential tightens against WTI benchmark as pipeline flows stabilize.',source:'BOE Report'},
            {title:'AECO Natural Gas Prices Could Average $3/mcf in 2026',link:'https://ca.finance.yahoo.com',pubDate:'2026-01-22',description:'Rising LNG export capacity expected to absorb oversupply that drove prices down in Western Canada last summer.',source:'Deloitte Canada'},
            {title:'US Drillers Cut Oil and Gas Rigs for Second Week in a Row',link:'https://boereport.com',pubDate:'2026-01-16',description:'Baker Hughes data shows continued rig count decline amid compressed margins in US shale basins.',source:'Baker Hughes'},
            {title:'Canadian Oil Production Reaches All-Time High of 3.5 Million bpd',link:'https://oilprice.com',pubDate:'2026-01-06',description:'Optimization and efficiency gains at producing assets drive record output despite lower oil prices.',source:'S&P Global'},
            {title:'Canadian Propane Exports Expected to Rise to 244,000 b/d in 2026',link:'https://spglobal.com',pubDate:'2025-12-23',description:'CERA forecasts growth from 230,000 b/d in 2025 as new Pacific Coast infrastructure comes online.',source:'S&P Global'},
            {title:'Pipeline Egress Constraints Could Widen Canadian Crude Differentials',link:'https://boereport.com',pubDate:'2026-01-08',description:'Seasonal winter output peaks and condensate blending requirements may push export pipelines near capacity through late 2026.',source:'Plainview Energy'},
            {title:'Natural Gas Remains Major Growth Engine as LNG Exports Expand',link:'https://ca.finance.yahoo.com',pubDate:'2026-01-22',description:'Gas replacing coal in power generation and rising electricity demand from data centres drive outlook.',source:'Deloitte Canada'},
            {title:'Enbridge Mainline Optimization Phase 1 Targeted for 2027',link:'https://boereport.com',pubDate:'2026-01-10',description:'Expansion adding 150,000 bpd represents nearest major pipeline capacity relief for Canadian producers.',source:'BOE Report'}
        ]
    };

    /* Feed configuration */
    var FEEDS={
        'canadian-energy':{sources:[{type:'rss',url:'https://boereport.com/feed/',name:'BOE Report'},{type:'gnews',q:'Canada+oil+gas+energy+production'}]},
        'wcsb-alberta':{sources:[{type:'gnews',q:'Alberta+WCSB+oil+gas+production+drilling'},{type:'rss',url:'https://www.jwnenergy.com/feed/',name:'JWN Energy'}]},
        'deals':{sources:[{type:'gnews',q:'oil+gas+acquisition+M%26A+Canada+energy+deal'}]},
        'commodity':{sources:[{type:'gnews',q:'WTI+crude+oil+price+WCS+natural+gas+Canada'}]}
    };

    /* RSS fetching strategies */
    function fetchViaRss2Json(rssUrl,count){
        count=count||12;
        var api='https://api.rss2json.com/v1/api.json?rss_url='+encodeURIComponent(rssUrl)+'&count='+count;
        return fetch(api,{signal:AbortSignal.timeout(8000)}).then(function(r){return r.json()}).then(function(d){
            if(d.status==='ok'&&d.items&&d.items.length)return d.items.map(normalizeR2J);
            return [];
        });
    }
    function fetchViaProxy(rssUrl,count){
        count=count||12;
        var proxy='https://api.allorigins.win/raw?url='+encodeURIComponent(rssUrl);
        return fetch(proxy,{signal:AbortSignal.timeout(10000)}).then(function(r){return r.text()}).then(function(xml){return parseRSSXml(xml,count)});
    }
    function fetchViaCorsProxy(rssUrl,count){
        count=count||12;
        var proxy='https://corsproxy.io/?'+encodeURIComponent(rssUrl);
        return fetch(proxy,{signal:AbortSignal.timeout(10000)}).then(function(r){return r.text()}).then(function(xml){return parseRSSXml(xml,count)});
    }
    function parseRSSXml(xml,count){
        try{
            var parser=new DOMParser();var doc=parser.parseFromString(xml,'text/xml');
            if(doc.querySelector('parsererror'))return [];
            var entries=doc.querySelectorAll('item');
            if(!entries.length)entries=doc.querySelectorAll('entry');
            var items=[];
            for(var i=0;i<Math.min(entries.length,count);i++){
                var el=entries[i];
                items.push({title:getTag(el,'title'),link:getTag(el,'link')||getAttr(el,'link','href'),pubDate:getTag(el,'pubDate')||getTag(el,'published')||getTag(el,'updated'),description:getTag(el,'description')||getTag(el,'summary')||getTag(el,'content'),source:getTag(el,'source')||getAttr(el,'source','url')||''});
            }
            return items;
        }catch(e){return [];}
    }
    function getTag(el,tag){var n=el.querySelector(tag);return n?n.textContent.trim():'';}
    function getAttr(el,tag,attr){var n=el.querySelector(tag);return n?n.getAttribute(attr)||'':'';}
    function normalizeR2J(item){return{title:item.title||'',link:item.link||'',pubDate:item.pubDate||'',description:item.description||item.content||'',source:item.author||''};}

    function fetchRSS(rssUrl,count){
        return fetchViaRss2Json(rssUrl,count).catch(function(){return [];}).then(function(items){
            if(items.length)return items;
            return fetchViaProxy(rssUrl,count).catch(function(){return [];});
        }).then(function(items){
            if(items.length)return items;
            return fetchViaCorsProxy(rssUrl,count).catch(function(){return [];});
        });
    }

    function gnewsUrl(q){return 'https://news.google.com/rss/search?q='+q+'&hl=en-CA&gl=CA&ceid=CA:en';}

    function fetchFeedCategory(key,count){
        var config=FEEDS[key];
        if(!config)return Promise.resolve(FALLBACK[key]||[]);
        count=count||9;
        var promises=config.sources.map(function(src){
            var url=src.type==='gnews'?gnewsUrl(src.q):src.url;
            return fetchRSS(url,count).then(function(items){
                if(src.name)items.forEach(function(it){if(!it.source)it.source=src.name;});
                return items;
            }).catch(function(){return [];});
        });
        return Promise.all(promises).then(function(results){
            var all=[],seen={};
            results.forEach(function(items){items.forEach(function(item){
                var k=cleanTitle(item.title).toLowerCase().substring(0,60);
                if(!seen[k]&&item.title){seen[k]=true;all.push(item);}
            });});
            all.sort(function(a,b){return new Date(b.pubDate)-new Date(a.pubDate);});
            var live=all.slice(0,count);
            if(live.length>=3)return live;
            return FALLBACK[key]||live;
        });
    }

    /* Display helpers */
    function cleanTitle(t){if(!t)return '';return t.replace(/\s+-\s+[^-]+$/,'').replace(/<[^>]*>/g,'').trim();}
    function extractSource(item){var s=item.source||item.author||'';if(!s&&item.title){var m=item.title.match(/\s-\s([^-]+)$/);if(m)s=m[1].trim();}return s.replace(/<[^>]*>/g,'').trim();}
    function cleanDesc(d){if(!d)return '';d=d.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();if(d.length>180)d=d.substring(0,177)+'...';return d;}
    function fmtDate(d){if(!d)return '';try{var dt=new Date(d);if(isNaN(dt))return '';return dt.toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'});}catch(e){return '';}}

    /* Render feed grid */
    function renderFeed(items,container){
        var html='<div class=\"g3\">';
        items.forEach(function(item){
            var date=fmtDate(item.pubDate),desc=cleanDesc(item.description),source=extractSource(item),title=cleanTitle(item.title);
            if(!title)return;
            html+='<div class=\"news-item rv vis\">';
            if(date)html+='<div class=\"news-date\">'+date+'</div>';
            html+='<h3>'+title+'</h3>';
            if(desc)html+='<p>'+desc+'</p>';
            if(source)html+='<div class=\"news-src\">'+source+'</div>';
            if(item.link)html+='<a href=\"'+item.link+'\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"news-link\">Read Article <svg viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" stroke=\"currentColor\" fill=\"none\" stroke-width=\"2\"><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3\"/></svg></a>';
            html+='</div>';
        });
        html+='</div>';
        container.innerHTML=html;
    }

    /* Load ticker */
    function loadTicker(){
        if(tickerLoaded)return;
        var track=document.getElementById('tickerTrack');
        if(!track)return;
        var tickerFeeds=[fetchRSS('https://boereport.com/feed/',15),fetchRSS(gnewsUrl('Canada+oil+gas+energy+Alberta'),10)];
        Promise.all(tickerFeeds.map(function(p){return p.catch(function(){return [];})})).then(function(results){
            var all=[],seen={};
            results.forEach(function(items){items.forEach(function(item){
                var k=cleanTitle(item.title).toLowerCase().substring(0,50);
                if(!seen[k]&&item.title){seen[k]=true;all.push(item);}
            });});
            if(!all.length){all=FALLBACK['canadian-energy'].concat(FALLBACK['wcsb-alberta']).concat(FALLBACK['deals']).concat(FALLBACK['commodity']);}
            var now=Date.now(),week=7*24*60*60*1000;
            var recent=all.filter(function(item){var pub=new Date(item.pubDate).getTime();return pub&&(now-pub)<week;});
            if(!recent.length)recent=all.slice(0,20);
            if(!recent.length){track.innerHTML='<div class=\"ticker-empty\">No recent headlines available.</div>';return;}
            recent.sort(function(a,b){return new Date(b.pubDate)-new Date(a.pubDate);});
            recent=recent.slice(0,20);
            var html='';
            recent.forEach(function(item){
                var src=extractSource(item),title=cleanTitle(item.title);
                if(!title)return;
                html+='<div class=\"ticker-item\"><div class=\"ticker-dot\"></div>';
                html+='<a href=\"'+(item.link||'#')+'\" target=\"_blank\" rel=\"noopener noreferrer\">';
                html+=title;
                if(src)html+='<span class=\"ticker-src\">'+src+'</span>';
                html+='</a></div>';
            });
            track.innerHTML=html+html;
            var speed=Math.max(40,recent.length*4);
            track.style.setProperty('--ticker-duration',speed+'s');
            tickerLoaded=true;
        });
    }

    /* Init news page */
    loadTicker();
    /* Load Outwest Updates (static content already in HTML, no dynamic feed needed) */

})();
