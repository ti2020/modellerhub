"""Fix spelling in text cells, cached text values and formula string literals of the 17 models.
Sheet names are NOT changed (formulas refer to them). Numbers are never touched."""
import re, zipfile, os, sys, json
from xml.sax.saxutils import escape, unescape

FIX = {
 # word (lowercase typo) -> correction (lowercase); case is preserved when applied
 "acconting":"accounting","accontng":"accounting","adjsment":"adjustment","adjusmet":"adjustment","adjusment":"adjustment","adjusments":"adjustments",
 "amortiztion":"amortization","amout":"amount","amounnt":"amount","andvance":"advance","aseets":"assets","assupmption":"assumption","assupmtion":"assumption",
 "aussmptions":"assumptions","aussumptions":"assumptions","auxiallary":"auxiliary","auxillary":"auxiliary","auxiliry":"auxiliary","axuillary":"auxiliary","axulliary":"auxiliary",
 "availble":"available","avialable":"available","avaialabe":"available","balnce":"balance","beginng":"beginning","beging":"beginning","beginnig":"beginning","begininnig":"beginning",
 "bset":"best","bulided":"built","buliding":"building","bulding":"building","bulidng":"building","bulidings":"buildings","buldings":"buildings",
 "capcity":"capacity","cearted":"created","cerated":"created","cerator":"creator","chagne":"change","cicualarity":"circularity","circualaity":"circularity","circualar":"circular",
 "commmon":"common","compenent":"component","corpration":"corporation","currancy":"currency","curruncy":"currency","currncy":"currency","currentlly":"currently","currntlly":"currently",
 "declinning":"declining","deperciation":"depreciation","deprcation":"depreciation","deprciation":"depreciation","deprcIation":"depreciation","deprecaition":"depreciation",
 "deprecaiton":"depreciation","deprecition":"depreciation","depreciaton":"depreciation","deprciation":"depreciation",
 "didends":"dividends","diferrences":"differences","differrences":"differences","differnces":"differences","difrences":"differences","difernces":"differences","diffrences":"differences",
 "disposle":"disposal","disposale":"disposal","dispositoin":"disposition","dispossition":"disposition","divdend":"dividend","dividemds":"dividends",
 "earnning":"earnings","ebidta":"ebitda","ebtda":"ebitda","edning":"ending","efficancy":"efficiency","eifficiancy":"efficiency","eixisting":"existing","exisiting":"existing","exsisting":"existing",
 "eqiuty":"equity","equiy":"equity","equty":"equity","europ":"europe","exasses":"excess","execsses":"excess","exuasse":"excess","expensses":"expenses",
 "farly":"farley","feets":"feet","finanacial":"financial","financail":"financial","fnincial":"financial","fixied":"fixed","fxied":"fixed","forecat":"forecast",
 "frigtht":"freight","furit":"fruit","furits":"fruits","genetal":"general","genral":"general","givien":"given","globle":"global","gorwth":"growth","growh":"growth",
 "goverment":"government","gverment":"government","hoome":"home","incomen":"income","inocme":"income","inome":"income","incrase":"increase",
 "infaltion":"inflation","infalation":"inflation","infation":"inflation","inflatin":"inflation","inflatiom":"inflation","infllation":"inflation",
 "ineterest":"interest","interset":"interest","intersest":"interest","instiute":"institute","institue":"institute",
 "intagable":"intangible","intangable":"intangible","intangbiles":"intangibles","isuance":"issuance","issance":"issuance","issueance":"issuance",
 "laibilities":"liabilities","laibilites":"liabilities","laiblities":"liabilities","laiblilities":"liabilities","libabilites":"liabilities","liablities":"liabilities",
 "liabiblities":"liabilities","liabilites":"liabilities","levarge":"leverage","libour":"libor","longterm":"long-term","maintinance":"maintenance","manfacture":"manufacture",
 "marign":"margin","matrial":"material","maxiuimum":"maximum","numeber":"number","oblgation":"obligation","occuppation":"occupancy","opearting":"operating","owend":"owned",
 "patote":"potato","payble":"payable","percentge":"percentage","perferred":"preferred","perferreds":"preferred","perpared":"prepared","porposes":"purposes","prcie":"price","prcies":"prices",
 "premuim":"premium","prjected":"projected","projceted":"projected","properitie":"property","properities":"properties","proprities":"properties",
 "reapay":"repay","recivable":"receivable","remaninning":"remaining","remeaning":"remaining","repament":"repayment","repaymnet":"repayment","repayed":"repaid",
 "reprchase":"repurchase","repuchase":"repurchase","revenune":"revenue","reveune":"revenue","revnenue":"revenue","revlover":"revolver","revoler":"revolver","revovler":"revolver","rvolver":"revolver",
 "rtae":"rate","salse":"sales","satetd":"stated","sataement":"statement","statemement":"statement","statemnt":"statement","scenrio":"scenario","senario":"scenario","scenairo":"scenario",
 "secnario":"scenario","secnarios":"scenarios","scheules":"schedules","shedule":"schedule","shcedule":"schedule","spce":"space","squre":"square","stoers":"stores","stort":"store",
 "storge":"storage","stright":"straight","summmary":"summary","switche":"switch","switchs":"switch","tota":"total","usefull":"useful","varable":"variable","variabble":"variable","varible":"variable",
 "volum":"volume","werehouse":"warehouse","werehuose":"warehouse","werehouses":"warehouses","woriking":"working","wose":"worse","wosre":"worse","yeild":"yield","yiled":"yield",
 "summaryof":"summary of","unblance":"unbalance",
}
PAT = re.compile(r"(?<![A-Za-z])(" + "|".join(sorted(map(re.escape, FIX), key=len, reverse=True)) + r")(?![A-Za-z])", re.I)

def case_like(src, dst):
    if src.isupper(): return dst.upper()
    if src[0].isupper(): return dst[0].upper() + dst[1:]
    return dst

def fix_text(t, log):
    def rep(m):
        w = m.group(1); new = case_like(w, FIX[w.lower()])
        log.append((w, new)); return new
    return PAT.sub(rep, t)

def fix_formula(f, log):
    # only inside "string literals"; references and functions are left alone
    return re.sub(r'"([^"]*)"', lambda m: '"' + fix_text(m.group(1), log) + '"', f)

def process(src, dst):
    log = []
    zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED)
    for it in zin.infolist():
        if it.filename == "xl/calcChain.xml": continue
        data = zin.read(it.filename)
        name = it.filename
        if name == "xl/sharedStrings.xml" or (name.startswith("xl/worksheets/sheet") and name.endswith(".xml")):
            x = data.decode("utf-8")
            # text nodes <t ...>...</t> (shared + inline strings)
            x = re.sub(r"(<t(?: [^>]*)?>)([^<]*)(</t>)", lambda m: m.group(1) + escape(fix_text(unescape(m.group(2)), log)) + m.group(3), x)
            if name.startswith("xl/worksheets/"):
                # cached text results of formula cells
                x = re.sub(r'(<c [^>]*t="str"[^>]*>(?:<f[^>]*/>|<f[^>]*>[^<]*</f>)?<v(?: [^>]*)?>)([^<]*)(</v>)',
                           lambda m: m.group(1) + escape(fix_text(unescape(m.group(2)), log)) + m.group(3), x)
                # string literals inside formulas
                x = re.sub(r"(<f(?: [^>]*)?>)([^<]*)(</f>)",
                           lambda m: m.group(1) + escape(fix_formula(unescape(m.group(2)), log)) + m.group(3), x)
                # data-validation dropdown lists, e.g. "Best,Base,Wose"
                x = re.sub(r"(<formula1>)([^<]*)(</formula1>)",
                           lambda m: m.group(1) + escape(fix_formula(unescape(m.group(2)), log)) + m.group(3), x)
            data = x.encode("utf-8")
        elif name == "xl/_rels/workbook.xml.rels":
            data = re.sub(rb"<Relationship [^>]*calcChain[^>]*/>", b"", data)
        elif name == "[Content_Types].xml":
            data = re.sub(rb"<Override [^>]*calcChain[^>]*/>", b"", data)
        elif name == "xl/workbook.xml":
            x = data.decode()
            if "<calcPr" in x and "fullCalcOnLoad" not in x:
                x = x.replace("<calcPr", '<calcPr fullCalcOnLoad="1"', 1)
            data = x.encode()
        zout.writestr(it, data)
    zout.close()
    return log
