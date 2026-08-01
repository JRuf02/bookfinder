# Create a new key / cert pair

Run in console:
`openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/CN=localhost"`

- This will enable the usage of https and thereby enable the site to use camera and location services.
- There will be a warning in the browser: self-signed certificate
- This could be omitted by
  - using mkcert for cert creation and installing mkcert on every device that accesses the website or
  - using a commercial CA (only possible with a fixed domain / static IP address)
