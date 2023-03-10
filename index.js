require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');
const mongoose = require('mongoose');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId();
const app = express();

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

console.log(mongoose.connection.readyState);

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: String
});

let Url = mongoose.model("Url", urlSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  var name = 'hello';
  // res.render('index', {myvalue:""});
  res.render('index', {link: "", shortcode: ""});

});

// Your first API endpoint
app.post('/', function(req, res) {
  console.log(uid.seq())
  console.log(req.body)
  inputurl = req.body.url;
  dns.lookup(urlParser.parse(inputurl).hostname, (err, addr) => {
    if (!addr) {
      // res.json({ error: "Invalid URL" });
      
      // res.render('index', {myvalue: "Invalid URL"});
      res.render('index', {link: "Invalid URL", shortcode: ""});

    }
    else {
      Url.findOne({ original_url: inputurl }, function(err, existingdata) {
        if (err) return console.log(err);
        if (!existingdata) {

          const url = new Url({ original_url: inputurl, short_url: uid()})
          url.save(function(err, data) {
            // res.json({ original_url: data.original_url, short_url: data.short_url})
            res.render('index', {link: "briefurl.live/"+ data.short_url, shortcode: data.short_url});
            if (err) return console.error(err);
          });
        }
        else {
          // res.json({ original_url: existingdata.original_url, short_url: existingdata.short_url})
          res.render('index', {link: "briefurl.live/"+ existingdata.short_url, shortcode: existingdata.short_url});

          // res.render('index', {myvalue: existingdata.short_url});

        }

      });

    }
  });
});

app.get('/:id', function(req, res) {
  const id = req.params.id;
  Url.findOne({short_url: id}, function(err, data) {
    if (!data) {
      res.json({ error: "Invalid URL" })
    }
    else {
      res.redirect(data.original_url)
    }
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});