import React, { useEffect, useMemo, useRef, useState } from 'react';

const KEY = 'acl-course-pulse-v2';

// Fictional teaching records for the self-contained UI/UX exercise.
// Staff names and course descriptions are examples, not GUC historical records.
const COURSE_CATALOG = {
  CSEN701: {
    name: 'Advanced Computer Lab',
    description: 'A project-focused course emphasizing teamwork, planning, software development, and delivery across several milestones.',
    history: [
      {year: '2025/26', instructors: ['Dr. Mariam Farouk'], tas: ['Yara Hassan', 'Omar Fawzy']},
      {year: '2024/25', instructors: ['Dr. Karim Nabil'], tas: ['Nour Adel', 'Mina Sameh']},
    ],
  },
  MATH204: {
    name: 'Linear Algebra',
    description: 'Vectors, matrices, linear systems, and mathematical methods used in technical problem solving.',
    history: [
      {year: '2025/26', instructors: ['Dr. Salma Younis'], tas: ['Layla Maher', 'Ahmed Sherif']},
      {year: '2024/25', instructors: ['Dr. Rana Hamdy'], tas: ['Youssef Tarek', 'Dina Mourad']},
    ],
  },
  CSEN401: {
    name: 'Software Engineering',
    description: 'Software requirements, architecture, implementation practices, testing, and collaborative development.',
    history: [
      {year: '2025/26', instructors: ['Dr. Tamer Elsayed'], tas: ['Rana Fathy', 'Adham Khalil']},
      {year: '2024/25', instructors: ['Dr. Hala Mansour'], tas: ['Malak Samir', 'Ali Mahmoud']},
    ],
  },
  HUMA101: {
    name: 'Critical Thinking & Communication',
    description: 'A discussion-based course about assessing arguments, presenting ideas, and communicating effectively.',
    history: [
      {year: '2025/26', instructors: ['Dr. Dina Saad'], tas: ['Mariam Hossam', 'Youssef Nader']},
      {year: '2024/25', instructors: ['Dr. Reem Taha'], tas: ['Farah Amr', 'Sara Magdy']},
    ],
  },
  CSEN202: {
    name: 'Data Structures',
    description: 'Core data organization techniques and algorithms, with a focus on selecting suitable structures for different problems.',
    history: [
      {year: '2025/26', instructors: ['Dr. Amina Rashed'], tas: ['Rami Elshamy', 'Nada Wael']},
      {year: '2024/25', instructors: ['Dr. Yasser Salem'], tas: ['Hana Ehab', 'Bassel Mostafa']},
    ],
  },
};
const getCourse = code => COURSE_CATALOG[code?.toUpperCase()] || {
  name: 'Course details not yet added',
  description: 'This course does not have a profile in the example catalog.',
  history: [],
  unknown: true,
};
const readRoute = () => {
  const match = window.location.hash.match(/^#\/courses\/([^/?#]+)$/);
  return match ? decodeURIComponent(match[1]).toUpperCase() : null;
};
const seed = [
  {id:'r1',courseCode:'CSEN701',rating:4,comment:'A challenging team project. The weekly milestones helped.',owner:'you',name:'You',date:'2026-10-06'},
  {id:'r2',courseCode:'CSEN701',rating:5,comment:'You learn the most when your group communicates well.',owner:'other',name:'Farida',date:'2026-10-02'},
  {id:'r3',courseCode:'MATH204',rating:3,comment:'Useful material but the pace felt fast.',owner:'other',name:'Karim',date:'2026-09-28'},
  {id:'r4',courseCode:'CSEN401',rating:4,comment:'Tutorial exercises are very important.',owner:'you',name:'You',date:'2026-09-24'},
  {id:'r5',courseCode:'HUMA101',rating:5,comment:'Well organized and approachable.',owner:'other',name:'Mariam',date:'2026-09-21'},
  {id:'r6',courseCode:'CSEN701',rating:3,comment:'Good practical work, but demanding during exam week.',owner:'other',name:'Youssef',date:'2026-09-15'},
  {id:'r7',courseCode:'MATH204',rating:5,comment:'Excellent explanation of difficult concepts.',owner:'other',name:'Nadine',date:'2026-08-30'},
  {id:'r8',courseCode:'CSEN401',rating:2,comment:'More worked examples in lectures would help.',owner:'other',name:'Adam',date:'2026-08-17'},
  {id:'r9',courseCode:'CSEN202',rating:4,comment:'The assignments strengthened problem-solving skills.',owner:'other',name:'Hassan',date:'2026-08-09'},
];
const RATING_WORDS = {1:'Poor', 2:'Fair', 3:'Good', 4:'Very good', 5:'Excellent'};

function getSaved(){try {const s=JSON.parse(localStorage.getItem(KEY));return Array.isArray(s)?s:seed;}catch{return seed;}}
const avgNum = a => a.length ? a.reduce((s,r)=>s+r.rating,0)/a.length : null;
const avg = a => a.length ? avgNum(a).toFixed(1) : '—';
const sameCode = (a,b) => a.trim().toUpperCase()===b.trim().toUpperCase();
const formatDate = d => {
  const t = new Date(`${d}T00:00:00`);
  return Number.isNaN(t.getTime()) ? '—' : t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
};

function Stars({n, size}){
  return <span className={`stars ${size||''}`} role="img" aria-label={`${n} out of 5 stars`}>
    <span aria-hidden="true">{'★'.repeat(n)}<span className="stars-off">{'★'.repeat(Math.max(0,5-n))}</span></span>
  </span>;
}

function Distribution({items}){
  const rows = [5,4,3,2,1].map(n=>({n,total:items.filter(r=>r.rating===n).length}));
  const max = Math.max(...rows.map(x=>x.total),1);
  return <div className="rating-bars">{rows.map(d=><div key={d.n} className="rating-row">
    <span>{d.n}★</span>
    <div className="barbg" aria-hidden="true"><i style={{width:`${d.total/max*100}%`}}/></div>
    <small>{d.total}<span className="sr-only"> review{d.total===1?'':'s'} with {d.n} stars</span></small>
  </div>)}</div>;
}

export default function App(){
  const [reviews,setReviews] = useState(getSaved);
  const [search,setSearch] = useState('');
  const [rating,setRating] = useState('all');
  const [mineOnly,setMineOnly] = useState(false);
  const [sort,setSort] = useState('newest');
  const [courseQuery,setCourseQuery] = useState('');
  const [editor,setEditor] = useState(null);
  const [error,setError] = useState('');
  const [notice,setNotice] = useState(null);
  const [section,setSection] = useState('overview');
  const [activeCourseCode,setActiveCourseCode] = useState(readRoute);

  useEffect(()=>{
    const changePage = () => {setActiveCourseCode(readRoute());window.scrollTo({top:0,behavior:'instant'});};
    window.addEventListener('hashchange',changePage);
    return ()=>window.removeEventListener('hashchange',changePage);
  },[]);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(reviews));}catch{/* storage unavailable */}},[reviews]);
  useEffect(()=>{
    if(!notice)return;
    const t=setTimeout(()=>setNotice(null),6000);
    return ()=>clearTimeout(t);
  },[notice]);

  const openCourse = code => {
    const c = code.trim().toUpperCase();
    window.location.hash=`#/courses/${encodeURIComponent(c)}`;
    setActiveCourseCode(c);
    window.scrollTo({top:0,behavior:'instant'});
  };
  const navigateTo = where => {
    setSection(where);
    if(window.location.hash && window.location.hash!=='#/') window.location.hash='#/';
    setActiveCourseCode(null);
    requestAnimationFrame(()=>{
      const el = where==='overview' ? null : document.getElementById(where==='courses'?'course-directory':'review-list');
      if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
      else window.scrollTo({top:0,behavior:'smooth'});
    });
  };

  const myReviewFor = code => reviews.find(r=>r.owner==='you' && sameCode(r.courseCode,code));
  const reviewsFor = code => reviews.filter(r=>sameCode(r.courseCode,code));

  // All courses known either from the catalog or from reviews.
  const courses = useMemo(()=>{
    const codes = [...new Set([...Object.keys(COURSE_CATALOG), ...reviews.map(r=>r.courseCode.toUpperCase())])];
    return codes.map(code=>{
      const items = reviews.filter(r=>sameCode(r.courseCode,code));
      return {code, name:getCourse(code).name, items, avg:avgNum(items), mine:!!items.find(r=>r.owner==='you')};
    }).sort((a,b)=>a.code.localeCompare(b.code));
  },[reviews]);
  const ratedCourses = courses.filter(c=>c.items.length).length;
  const q = courseQuery.trim().toLowerCase();
  const shownCourses = courses.filter(c=>!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  // Keep the original "look up any course code" ability: a code-shaped query with no match still gets a details link.
  const exactUnknown = !shownCourses.length && /^[a-z]{2,6}\s?\d{2,4}$/i.test(q) ? q.replace(/\s/g,'').toUpperCase() : null;

  const result = useMemo(()=>{
    const s = search.trim().toLowerCase();
    const list = reviews.filter(r=>
      (rating==='all'||r.rating===Number(rating)) &&
      (!mineOnly||r.owner==='you') &&
      `${r.courseCode} ${getCourse(r.courseCode).name} ${r.comment} ${r.name}`.toLowerCase().includes(s));
    const by = {
      newest:(a,b)=>b.date.localeCompare(a.date),
      oldest:(a,b)=>a.date.localeCompare(b.date),
      highest:(a,b)=>b.rating-a.rating||b.date.localeCompare(a.date),
      lowest:(a,b)=>a.rating-b.rating||b.date.localeCompare(a.date),
    }[sort];
    return [...list].sort(by);
  },[reviews,search,rating,mineOnly,sort]);
  const filtersActive = search.trim() || rating!=='all' || mineOnly;
  const clearFilters = () => {setSearch('');setRating('all');setMineOnly(false);};

  function openEditor(r, presetCode=''){
    if(r&&r.owner!=='you')return;
    // One review per course: if the user already reviewed this course, open that review instead.
    if(!r && presetCode){const existing=myReviewFor(presetCode);if(existing)r=existing;}
    setError('');
    setEditor({id:r?.id||null, courseCode:r?.courseCode||presetCode, rating:String(r?.rating||''), comment:r?.comment||''});
  }
  const closeEditor = () => {setEditor(null);setError('');};
  const duplicate = editor && editor.courseCode.trim() ? reviews.find(r=>r.id!==editor.id&&r.owner==='you'&&sameCode(r.courseCode,editor.courseCode)) : null;

  function submit(e){
    e.preventDefault();
    if(!editor.courseCode.trim()){setError('Enter a course code, for example CSEN701.');return;}
    if(!/^[1-5]$/.test(editor.rating)){setError('Choose a rating from 1 to 5 stars.');return;}
    if(duplicate){setError(`You have already reviewed ${duplicate.courseCode.toUpperCase()}. Edit that review instead.`);return;}
    const payload={courseCode:editor.courseCode.trim().toUpperCase(),rating:Number(editor.rating),comment:editor.comment.trim(),name:'You',owner:'you',date:new Date().toISOString().slice(0,10)};
    if(editor.id){setReviews(reviews.map(r=>r.id===editor.id?{...r,...payload}:r));setNotice({text:`Your review of ${payload.courseCode} was updated.`,code:payload.courseCode});}
    else{setReviews([{...payload,id:'r-'+Date.now()},...reviews]);setNotice({text:`Your review of ${payload.courseCode} was posted.`,code:payload.courseCode});}
    closeEditor();
  }
  function reset(){
    if(!window.confirm('Reset the demo? This removes your changes and restores the example reviews.'))return;
    setReviews(seed);clearFilters();setSort('newest');setCourseQuery('');closeEditor();setNotice({text:'Example data restored.'});
  }

  const noticeBar = notice && <div className="notice" role="status">
    <span>✓ {notice.text}</span>
    <span className="notice-actions">
      {notice.code && notice.code!==activeCourseCode && <button type="button" className="link-btn" onClick={()=>{openCourse(notice.code);setNotice(null);}}>View course</button>}
      <button type="button" onClick={()=>setNotice(null)} aria-label="Dismiss message">✕</button>
    </span>
  </div>;

  const navItems = [
    {id:'overview', icon:'▦', label:'Overview', go:()=>navigateTo('overview')},
    {id:'courses', icon:'▤', label:'Courses', go:()=>navigateTo('courses')},
    {id:'reviews', icon:'≡', label:'Browse reviews', go:()=>{setMineOnly(false);navigateTo('reviews');}},
  ];
  const activeNav = activeCourseCode ? 'courses' : section;

  return <div className="review-app">
    <aside className="sidebar">
      <div className="logo"><span aria-hidden="true">✦</span> course<span>pulse</span></div>
      <nav aria-label="Main">
        <div className="side-caption">WORKSPACE</div>
        {navItems.map(n=><button key={n.id} type="button" className={activeNav===n.id?'active':''} aria-current={activeNav===n.id?'page':undefined} aria-label={n.label} title={n.label} onClick={n.go}><span aria-hidden="true">{n.icon}</span><b>{n.label}</b></button>)}
        <div className="side-caption gap">YOUR SPACE</div>
        <button type="button" aria-label="Write a review" title="Write a review" onClick={()=>openEditor(null, activeCourseCode||'')}><span aria-hidden="true">＋</span><b>Write a review</b></button>
        <button type="button" className={activeNav==='mine'?'active':''} aria-label="Your reviews" title="Your reviews" onClick={()=>{setSearch('');setRating('all');setMineOnly(true);navigateTo('mine');}}><span aria-hidden="true">♡</span><b>Your reviews</b></button>
      </nav>
      <div className="side-end"><div className="badge-face" aria-hidden="true">Y</div><div><strong>You</strong><small>Signed in as student</small></div></div>
    </aside>

    <main className="content">{activeCourseCode ? (() => {
      const info = getCourse(activeCourseCode);
      const items = reviewsFor(activeCourseCode).sort((a,b)=>(b.owner==='you')-(a.owner==='you')||b.date.localeCompare(a.date));
      const mine = items.find(r=>r.owner==='you');
      return <section className="course-detail-page" aria-labelledby="course-title">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="link-btn" onClick={()=>navigateTo('courses')}>Courses</button><span aria-hidden="true">›</span><span aria-current="page">{activeCourseCode}</span>
        </nav>
        {noticeBar}
        <header className="course-hero">
          <div className="course-hero-text">
            <p className="eyebrow">COURSE PROFILE · {activeCourseCode}</p>
            <h1 id="course-title">{info.name}</h1>
            <p className="course-description">{info.description}</p>
            <div className="hero-actions">
              <button type="button" className="post-review" onClick={()=>openEditor(mine||null, activeCourseCode)}>{mine?'✎ Edit your review':'＋ Review this course'}</button>
              {mine && <span className="hint">You reviewed this course on {formatDate(mine.date)}.</span>}
            </div>
          </div>
          <div className="course-mini-score">
            <small>STUDENT RATING</small>
            <strong>{avg(items)}<em> / 5</em></strong>
            <span>{items.length ? `from ${items.length} review${items.length===1?'':'s'}` : 'No reviews yet'}</span>
            {items.length>0 && <Distribution items={items}/>}
          </div>
        </header>
        <div className="course-details-grid">
          <section className="panel course-feedback" aria-labelledby="fb-title">
            <div className="detail-review-head"><div><h2 id="fb-title">What students say</h2><p>{items.length} review{items.length===1?'':'s'} for {activeCourseCode}. Your own review is shown first.</p></div></div>
            {items.length ? items.map(r=><article className={`course-review ${r.owner==='you'?'is-mine':''}`} key={r.id}>
              <div className="course-review-top"><strong>{r.name}{r.owner==='you'&&<span className="tag">Your review</span>}</strong><Stars n={r.rating}/></div>
              <p>{r.comment||<i className="dim">No comment provided</i>}</p>
              <div className="course-review-meta"><time dateTime={r.date}>{formatDate(r.date)}</time>{r.owner==='you'&&<button type="button" className="row-edit" onClick={()=>openEditor(r)}>Edit your review</button>}</div>
            </article>) : <div className="course-review-empty">No reviews for this course yet. <button type="button" className="link-btn" onClick={()=>openEditor(null, activeCourseCode)}>Be the first to review it</button></div>}
          </section>
          <section className="panel teaching-history" aria-labelledby="th-title"><h2 id="th-title">Teaching history</h2><p>Instructors and teaching assistants for the last two academic years.</p>
            {info.history.length ? info.history.map(entry=><div className="teaching-entry" key={entry.year}>
              <h3>{entry.year}</h3>
              <dl>
                <dt>Instructor{entry.instructors.length===1?'':'s'}</dt><dd>{entry.instructors.join(', ')}</dd>
                <dt>Teaching assistants</dt><dd>{entry.tas.join(', ')}</dd>
              </dl>
            </div>) : <p className="history-empty">No example teaching records for this course.</p>}
            <p className="teaching-disclaimer">Illustrative course and teaching records; staff names are fictional.</p>
          </section>
        </div>
        <div className="detail-footer">
          <button type="button" className="outline" onClick={()=>navigateTo('courses')}>← Back to all courses</button>
          <button type="button" className="outline" onClick={()=>navigateTo('reviews')}>Browse all reviews</button>
        </div>
      </section>;
    })() : <>
      <header className="page-head">
        <div><p className="eyebrow">ACADEMIC FEEDBACK PORTAL</p><h1>Course Review Board</h1><p>Compare courses, read what past students say, and share your own experience.</p></div>
        <button type="button" className="post-review" onClick={()=>openEditor(null)}>＋ Write a review</button>
      </header>
      {noticeBar}
      <section className="metrics" aria-label="Summary">
        <div className="metric"><small>ALL REVIEWS</small><strong>{reviews.length}</strong><span>Student contributions</span></div>
        <div className="metric"><small>AVERAGE SCORE</small><strong>{avg(reviews)} <em>/ 5</em></strong><span>Across all courses</span></div>
        <div className="metric"><small>COURSES RATED</small><strong>{ratedCourses}<em> of {courses.length}</em></strong><span>Courses with at least one review</span></div>
      </section>

      <div className="analytic-grid">
        <section className="panel directory" id="course-directory" aria-labelledby="dir-title">
          <div className="panel-head"><div><h2 id="dir-title">Courses</h2><p>Look up a course to see its average score, reviews and teaching history.</p></div></div>
          <label className="field">Find a course
            <div className="searchinput"><span aria-hidden="true">⌕</span><input value={courseQuery} onChange={e=>setCourseQuery(e.target.value)} placeholder="Course code or name, e.g. CSEN701 or Linear"/></div>
          </label>
          <ul className="course-list">
            {shownCourses.map(c=><li key={c.code}>
              <button type="button" className="course-card" onClick={()=>openCourse(c.code)} aria-label={`${c.code} ${c.name}, average ${c.avg===null?'not rated':c.avg.toFixed(1)}, ${c.items.length} reviews${c.mine?', you reviewed this course':''}. View details`}>
                <span className="cc-main"><strong>{c.code}{c.mine && <span className="tag">You reviewed</span>}</strong><small>{c.name}</small></span>
                <span className="cc-score">{c.avg===null ? <span className="dim">Not rated</span> : <><b>{c.avg.toFixed(1)}</b><Stars n={Math.round(c.avg)} size="sm"/></>}<small>{c.items.length} review{c.items.length===1?'':'s'}</small></span>
                <span className="cc-go" aria-hidden="true">›</span>
              </button>
            </li>)}
            {exactUnknown && <li><button type="button" className="course-card" onClick={()=>openCourse(exactUnknown)}><span className="cc-main"><strong>{exactUnknown}</strong><small>Not in the catalog yet</small></span><span className="cc-score"><span className="dim">0 reviews</span></span><span className="cc-go" aria-hidden="true">›</span></button></li>}
            {!shownCourses.length && !exactUnknown && <li className="empty">No courses match.</li>}
          </ul>
        </section>

        <section className="panel pulse" aria-labelledby="pulse-title">
          <div className="panel-head"><div><h2 id="pulse-title">Rating overview</h2><p>How all reviews are spread across 1–5 stars.</p></div></div>
          <div className="pulse-content">
            <div className="donut" style={{background:`conic-gradient(#218a94 0 ${(avgNum(reviews)||0)/5*100}%, #e3ebee 0 100%)`}} role="img" aria-label={`Average ${avg(reviews)} out of 5`}><div><span>{avg(reviews)}</span><small>OUT OF 5</small></div></div>
            <Distribution items={reviews}/>
          </div>
        </section>
      </div>

      <section className="review-list panel" id="review-list" aria-labelledby="rl-title">
        <div className="panel-head reviews-heading"><div><h2 id="rl-title">{mineOnly?'Your reviews':'All student reviews'}</h2><p>Search by course, comment or reviewer. Filters apply as you type.</p></div></div>
        <div className="searchbar" role="search">
          <label className="grow"><span className="sr-only">Search reviews</span><div className="searchinput"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search course, comment or reviewer"/></div></label>
          <label><span>Rating</span><select value={rating} onChange={e=>setRating(e.target.value)}><option value="all">All ratings</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} star{n===1?'':'s'}</option>)}</select></label>
          <label><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="highest">Highest rating</option><option value="lowest">Lowest rating</option></select></label>
          <label className="check"><input type="checkbox" checked={mineOnly} onChange={e=>setMineOnly(e.target.checked)}/> Only my reviews</label>
          {filtersActive && <button type="button" className="link-btn" onClick={clearFilters}>Clear filters</button>}
        </div>
        <div className="rows-wrapper"><table>
          <caption className="sr-only">Student reviews</caption>
          <thead><tr><th scope="col">Course</th><th scope="col">Rating</th><th scope="col">Student comment</th><th scope="col">Reviewer</th><th scope="col">Date</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{result.map(r=><tr key={r.id} className={r.owner==='you'?'is-mine':''}>
            <td data-label="Course"><button type="button" className="course-link" onClick={()=>openCourse(r.courseCode)}><strong>{r.courseCode.toUpperCase()}</strong><small>{getCourse(r.courseCode).name}</small></button></td>
            <td data-label="Rating" className="ratingcell"><Stars n={r.rating}/></td>
            <td data-label="Comment" className="commentcell">{r.comment||<i className="dim">No comment provided</i>}</td>
            <td data-label="Reviewer">{r.owner==='you'?<span className="tag">You</span>:r.name}</td>
            <td data-label="Date"><time dateTime={r.date}>{formatDate(r.date)}</time></td>
            <td className="actioncell">{r.owner==='you'&&<button type="button" className="row-edit" onClick={()=>openEditor(r)} aria-label={`Edit your review of ${r.courseCode}`}>Edit</button>}</td>
          </tr>)}
          {result.length===0&&<tr><td colSpan="6" className="empty">No reviews match these filters. {filtersActive&&<button type="button" className="link-btn" onClick={clearFilters}>Clear filters</button>}</td></tr>}</tbody>
        </table></div>
        <div className="tablefoot"><span aria-live="polite">Showing {result.length} of {reviews.length} reviews</span><button type="button" className="danger-link" onClick={reset}>Reset demo data</button></div>
      </section>
    </>}
    </main>

    {editor && <ReviewModal editor={editor} setEditor={setEditor} error={error} setError={setError} duplicate={duplicate} onSubmit={submit} onClose={closeEditor} onEditExisting={()=>openEditor(duplicate)}/>}
  </div>;
}

function ReviewModal({editor,setEditor,error,setError,duplicate,onSubmit,onClose,onEditExisting}){
  const dialogRef = useRef(null);
  const codeRef = useRef(null);
  const ratingRef = useRef(null);
  const lastFocus = useRef(document.activeElement);
  const known = COURSE_CATALOG[editor.courseCode.trim().toUpperCase()];

  useEffect(()=>{
    (editor.courseCode ? ratingRef.current : codeRef.current)?.focus();
    const prev = lastFocus.current;
    const onKey = e => {
      if(e.key==='Escape'){e.preventDefault();onClose();}
      if(e.key==='Tab'){
        const f=[...dialogRef.current.querySelectorAll('button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled);
        if(!f.length)return;
        if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus();}
        else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus();}
      }
    };
    document.addEventListener('keydown',onKey);
    return ()=>{document.removeEventListener('keydown',onKey);prev?.focus?.();};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[editor.id]);

  const update = (k,v) => {setError('');setEditor(s=>({...s,[k]:v}));};

  return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
      <div className="modal-title">
        <div><p className="eyebrow">YOUR CONTRIBUTION</p><h2 id="modal-title">{editor.id?`Edit your review`:'Write a course review'}</h2><p>You can write one review per course and edit it at any time.</p></div>
        <button type="button" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <form onSubmit={onSubmit} noValidate>
        <label><span className="label-row">Course code <span className="req">required</span></span>
          <input ref={codeRef} list="course-options" value={editor.courseCode} onChange={e=>update('courseCode',e.target.value)} placeholder="e.g. CSEN701" autoComplete="off" aria-describedby="code-help" aria-invalid={!!duplicate}/>
          <datalist id="course-options">{Object.entries(COURSE_CATALOG).map(([c,v])=><option key={c} value={c}>{v.name}</option>)}</datalist>
          <small id="code-help" className={`field-help ${duplicate?'warn':''}`}>
            {duplicate ? <>You already reviewed {duplicate.courseCode.toUpperCase()}. <button type="button" className="link-btn" onClick={onEditExisting}>Edit that review instead</button></>
              : editor.courseCode.trim() ? (known ? `✓ ${known.name}` : 'Not in the course catalog — check the code is correct.')
              : 'Start typing to pick from the course list.'}
          </small>
        </label>
        <fieldset className="star-input">
          <legend>Rating <span className="req">required</span></legend>
          <div className="star-options" role="radiogroup">
            {[1,2,3,4,5].map(n=><label key={n} className={Number(editor.rating)>=n?'on':''} title={`${n} – ${RATING_WORDS[n]}`}>
              <input ref={(editor.rating?editor.rating===String(n):n===1)?ratingRef:undefined} type="radio" name="rating" value={n} checked={editor.rating===String(n)} onChange={()=>update('rating',String(n))}/>
              <span aria-hidden="true">★</span><span className="sr-only">{n} star{n===1?'':'s'} – {RATING_WORDS[n]}</span>
            </label>)}
            <span className="star-word" aria-hidden="true">{editor.rating?`${editor.rating} – ${RATING_WORDS[editor.rating]}`:'Select 1 to 5 stars'}</span>
          </div>
        </fieldset>
        <label><span className="label-row">Comment <span className="opt">optional</span></span>
          <textarea value={editor.comment} rows={5} onChange={e=>update('comment',e.target.value)} placeholder="What should a student know before taking this course?"/>
        </label>
        {error&&<div className="formerror" role="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="outline" onClick={onClose}>Cancel</button>
          <button className="post-review" type="submit" disabled={!!duplicate}>{editor.id?'Save changes':'Post review'}</button>
        </div>
      </form>
    </div>
  </div>;
}
