const fs = require("fs")

const watchPath = __dirname + "/src/scss/"

const watcher = fs.watch(watchPath, {
   recursive: true
})

let i = 0
watcher.on("change", (eType, fileName) => {
   if (eType !== "change") return
   if (fileName.endsWith(".scss")) return
   if (!fileName.endsWith(".css")) return

   i++
   if (i > 1) return i = 0

   moveCSSFileToDist(watchPath + fileName)
})

const rgx = /(\\|\/|\\\\|\/\/)/g
const moveCSSFileToDist = (url) => {

   const { pageName, cssPath, fileName } = parseMyCssUrl(url)


   if (!fs.existsSync(`./dist/css/${pageName}`)) {
      fs.mkdirSync(`./dist/css/${pageName}`, { recursive: true })
   }
   

   // console.log({fileName, pageName, cssPath})
   const readStream = fs.createReadStream(url)
   
   const writeStream = fs.createWriteStream(`./dist/css/${pageName}/${fileName}`)
   readStream.pipe(writeStream)

   readStream.on("end", () => readStream.close())

   if (fs.existsSync(cssPath)) {
      fs.rm(cssPath, { recursive: true }, (err) => {
         if (err) return console.log(err)
      })
   }
}

const parseMyCssUrl = (cssUrl) => {
   const arr = cssUrl.replace(rgx, ",").split(",")

   let pageName = ""
   let cssPath = ""
   let cssFound = false
   for (let i = 0; i < arr.length; i++) {

      if (arr[i] === "scss") pageName =  arr[i + 1]

      // build css root dir
      if (!cssFound) {
         cssPath += arr[i] + "/"
      }
      if (arr[i] === "css") cssFound = true


   }

   return {pageName, cssPath, fileName: arr[arr.length - 1]}
}