import os
import jinja2
import webapp2
import logging
import yaml
import re
from collections import OrderedDict
from google.appengine.api import memcache

JINJA_ENVIRONMENT = jinja2.Environment(
  loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
  extensions=['jinja2.ext.autoescape'],
  autoescape=True)

# memcache logic: maintain a separate cache for each explicit
# app version, so staged versions of the docs can have new nav
# structures, redirects without affecting other deployed docs.

# CURRENT_VERSION_ID format is version.hash, where version is the
# app version passed to the deploy script.
MEMCACHE_PREFIX = 'no_version/'
if 'CURRENT_VERSION_ID' in os.environ:
  MEMCACHE_PREFIX = os.environ.get('CURRENT_VERSION_ID').split('.')[0] + '/'

REDIRECTS_FILE = 'redirects.yaml'
IS_DEV = os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')

# base path for site links & redirects
# NOTE: URLs in the site footer are hardcoded and need to be updated separately
SITE_URLS = {
  'site_classic': 'https://polymer-library.polymer-project.org'
}

def load_yaml_config(filename):
  try:
    with open(filename) as f:
      config = yaml.load(f)
      if config is None:
        logging.warning("No config data in %s." % filename)
      return config
  except IOError:
    logging.error("Error: Couldn't load file %s." % filename, exc_info=True)
  except yaml.YAMLError, exc:
    logging.error("Error: parsing %s." % filename, exc_info=True)

def read_redirects_file(filename):
  redirects = load_yaml_config(filename)
  literals = {}
  wildcards = {}
  # Break lines into dict.
  # e.g. "/0.5/page.html /1.0/page" -> {"/0.5/page.html": "/1.0/page")
  # If the redirect path ends with *, treat it as a wildcard.
  # e.g. "/0.5/* /1.0/" redirects "/0.5/foo/bar" to "/1.0/foo/bar"
  # variables in SITE_URLS can be added with __underscores__ :
  # /1.0/ __site_classic__/1.0/
  for r in redirects:
    parts = r.split()
    match = re.match('__([a-z0-9_-]+)__(.*)', parts[1])
    if match:
	logging.warning("Matching.")
	site = match.group(1)
	if site in SITE_URLS: 
	  logging.warning("Foo: %s %s" % (site, match.group(2)))
	  parts[1] = SITE_URLS[site] + match.group(2)
          logging.warning("Found redirect URL %s" % parts[1])
	else:
	  logging.error("Bad site in redirect file: %s" % site)
    else:
	logging.warning("No match for %s" % parts[1])
    if parts[0].endswith('*'):
      wildcards[parts[0][:-1]] = parts[1]
    else:
      literals[parts[0]] = parts[1]
  # sort the wildcards longest-first, so a more specific wilcard gets picked over a less specific one.
  sortedWildcards = OrderedDict(sorted(wildcards.items(), lambda a, b: len(b) - len(a)))
  return {'literal': literals, 'wildcard': sortedWildcards}

# Match HTML pages from path; similar to behavior of Jekyll on GitHub Pages.
def find_template(path):
  if path.endswith('/'):
    # / -> /index.html, /try/ -> /try/index.html
    return JINJA_ENVIRONMENT.get_template(path + 'index.html')
  elif path.endswith('.html'):
    # /index.html, /try/create.html
    return JINJA_ENVIRONMENT.get_template(path)
  try:
    # /try/create -> /try/create.html
    return JINJA_ENVIRONMENT.get_template(path + '.html')
  except jinja2.exceptions.TemplateNotFound:
    pass
  # /try -> /try/index.html
  return JINJA_ENVIRONMENT.get_template(path + '/index.html')

class MainPage(webapp2.RequestHandler):
  def redirect_if_needed(self, path):
    redirect_cache = MEMCACHE_PREFIX + REDIRECTS_FILE
    redirects = memcache.get(redirect_cache)
    if redirects is None or IS_DEV:
      redirects = read_redirects_file(REDIRECTS_FILE)
      memcache.add(redirect_cache, redirects)

    literals = redirects.get('literal')
    if path in literals:
      self.redirect(literals.get(path), permanent=True)
      return True

    wildcards = redirects.get('wildcard')
    for prefix in wildcards:
      if path.startswith(prefix):
        self.redirect(path.replace(prefix, wildcards.get(prefix)), permanent=True)
        return True

    return False

  def get(self):
    if self.redirect_if_needed(self.request.path):
      return

    try:
      template = find_template(self.request.path)
      self.response.headers['Cache-Control'] = 'public, max-age=60'
    except jinja2.exceptions.TemplateNotFound:
      template = find_template('/404.html')
      self.response.set_status(404)
    except Exception:
      template = find_template('/500.html')
      self.response.set_status(500)
    self.response.write(template.render({}))

app = webapp2.WSGIApplication([
  ('/.*', MainPage),
])
