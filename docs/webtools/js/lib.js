function gE(id) { return document.getElementById(id) } // get an Element by ID
function gV(id) { return gE(id).value } // get an Element value by ID
function gC(id) { return gE(id).checked } // get checked status of a checkbox by ID
function fromCP() { navigator.clipboard.readText().then((t) => { gE("intext").value = t; window.run() }); } // read clipboard and use kit for intext textarea content
function toCP() { navigator.clipboard.writeText(gV("outtext")) } // copy outtext textarea content to clipboard
function setErr(id, e) { gE(id).style.borderColor = "red"; gE(id).style.color = "red"; if (e) gE("outtext").value = e.message } // set an element as in error
function setOK(id) { gE(id).style.borderColor = "inherit"; gE(id).style.color = "inherit"; } // set an element as OK
function sErr(ids, e) { if (Array.isArray(ids)) { ids.forEach(id => setErr(id, e)) } else { setErr(ids, e) } } // set elements as in error
function sOK(ids) { if (Array.isArray(ids)) { ids.forEach(id => setOK(id)) } else { setOK(ids) } } // set elements as OK
function r(N) { return Math.floor(Math.random() * N) } // get a random integer nbr between 0 and N not included
function ran(N) { if (Array.isArray(N)) { return N[r(N.length)] } else if (typeof N === 'string') { return N.charAt(r(N.length)) } else { return r(N) } } // get a random el from an Array, char from a string or a number between 0 and N not included// get a random el from an Array, char from a string or a number between 0 and N not included
function ranTxt(len, pool) { let r = '', i = 0; for (; i < len; i++) { r += ran(pool); }; return r } // create random string of length len based on chars in pool 
function ranNum(len) { let n = ranTxt(len, '0123456789'); return len < 16 ? parseInt(n) : BigInt(n) } // create random number of length len
function createEl(typ, attrs) { let el = document.createElement(typ); Object.assign(el, attrs); return el } // create a html document element
function addChild(typ, attrs, id) { gE(id).appendChild(createEl(typ, attrs)) } // add a child element to an existing html document element
function addArEl(pid, i, txt, siz) { let id = pid + i; addChild("div", { id: "div" + id, innerHTML: '<label for="' + id + '">' + txt + i + ':&nbsp;</label><input type="text" id="' + id + '" size=' + siz + ' oninput="run()"><br>' }, pid + "s") } // add html element to array
function intxt(i) { return createEl("div", { innerHTML: "<h2>Input <button onclick='fromCP()'>Get From Clipboard</button><button onclick='gE(\"" + "infile" + "\").click()'>Upload File</button><input type='file' style='display:none;' id='infile' onchange='doUL()'/></h2><textarea id='intext' rows='" + i[0] + "' cols='" + i[1] + "'></textarea>" }) }
function outxt(o) { return createEl("div", { innerHTML: "<h2>Output <button onclick='toCP()'>Copy To Clipboard</button><button onclick='doDL()'>Download</button></h2><textarea id='outtext' rows='" + o[0] + "' cols='" + o[1] + "' readonly></textarea>" }) }
function doUL() { let r = new FileReader(); r.onload = e => { gE('intext').value = e.target.result; window.run() }; r.readAsText(gE("infile").files[0]) } // upload file as intext
function doDL() { createEl("a", { href: "data:x-application/text," + escape(gV("outtext")), download: 'output.txt' }).click() } // download outtext as file
function mngAr(ars) { // manage nbr of elements in input arrays
  let ar = ars
  return () => { // return closure
    ar.forEach(a => { // for each array : remove last array elements if empty, leave 1 empty array element at end
      while ((a.n > 1) && ((gV(a.i + a.n) == "") && (gV(a.i + (a.n - 1)) == ""))) { gE(a.i + "s").removeChild(gE("div" + a.i + a.n--)) }
      if (gV(a.i + a.n) != '') { addArEl(a.i, ++a.n, a.t, a.s) }
    })
  }
}
async function doSetup(f, out, inp, ar = []) { // set up the webpage
  Object.assign(window, { run: f, toCP: toCP, fromCP: fromCP, doDL: doDL, doUL: doUL, gE: gE }) // make sure document sees the functions
  if (inp) { document.body.appendChild(intxt(inp)) } // create the intext text area and related heading and buttons
  if (out) { document.body.appendChild(outxt(out)) } // create the outtext text area and related heading and buttons
  const p = new URLSearchParams(document.location.search) // capture URL parameters and apply them to the relevant elements
  if (p.has("paramfile")) { try { const js = await (await fetch(p.get("paramfile"))).json(); Object.keys(js).forEach(k => p.append(k, js[k])) } catch (e) { } } // get parameters from a parameter file in JSON format 
  ar.forEach(a => { let i = 1; do { addArEl(a.i, i, a.t, a.s) } while (p.has(a.i + (i++))); a.n = --i; }); // handle arrayed input texts - a is like { i: "xp", t: "XPath ", s: "40" }
  let mngArs = mngAr(ar); window.run = () => { mngArs(); f(); }
  ["input[type = 'text']", "#intext", "input[type='checkbox']", "select"].forEach(q => { // set input field value to parameter value
    document.querySelectorAll(q).forEach(e => {
      if (p.has(e.id)) { e.type === 'checkbox' ? e.checked = (p.get(e.id) == "on") : e.value = p.get(e.id) }
      gE(e.id).addEventListener("input", f) // call run() when content changes
    })
  })
  window.run()
}