/*
  Philips Hue Control from Processing
  early version. Needs cleanup.
  
  Uses Rune Madsen's HTTP library, so you need to install it from the library manager. 
  
  created 23 March 2020
  by Tom Igoe
*/

// these imports will get shorter when my pull request to Rune's library is complete:
import http.requests.*;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map.Entry;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.*;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.auth.BasicScheme;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;


// Hue hub IP address. Fill in the right one for your hue hub:
String server = "http://192.168.1.24";
// Hue hub user name. Fill in yours here:
String username = "hue-hub-username";
// light that you want to control:
int lightNumber = 10;
boolean lightState = true;

public void setup() {
  size(400, 400);
  smooth();
  // one draw loop every 5 seconds:
  frameRate(0.2);
}

void draw() {
   // form the request string: http://hue.hub.ip.address/apu/username/lights/lightNumber/state/ :
  String requestString = server + "/api/" + username + "/lights/" + lightNumber + "/state";
  // make a new request:
  PutRequest put = new PutRequest(requestString);
  // add the content-type header:
  put.addHeader("Content-Type", "application/json");
  // add the body of the request:
  put.addData("{\"on\":" + lightState + "}");
  // send the request:
  put.send();
  // print the response
  println("Reponse Content: " + put.getContent());
 // change the state for next time through the draw loop:
  lightState = !lightState;
}


// this part will get folded into the HTTP library if all goes well:
public class PutRequest
{
  String url;
  ArrayList<BasicNameValuePair> nameValuePairs;
  HashMap<String, File> nameFilePairs;
  ArrayList<BasicNameValuePair> headerPairs;
  StringEntity stringEntity;

  String content;
  String encoding;
  HttpResponse response;
  UsernamePasswordCredentials creds;

  public PutRequest(String url)
  {
    this(url, "ISO-8859-1");
  }

  public PutRequest(String url, String encoding) 
  {
    this.url = url;
    this.encoding = encoding;
    nameValuePairs = new ArrayList<BasicNameValuePair>();
    nameFilePairs = new HashMap<String, File>();
    this.headerPairs = new ArrayList<BasicNameValuePair>();
  }

  public void addUser(String user, String pwd) 
  {
    creds = new UsernamePasswordCredentials(user, pwd);
  }

  public void addHeader(String key, String value) {
    BasicNameValuePair nvp = new BasicNameValuePair(key, value);
    headerPairs.add(nvp);
  } 

  public void addData(String key, String value) 
  {
    BasicNameValuePair nvp = new BasicNameValuePair(key, value);
    nameValuePairs.add(nvp);
  }

// overloads addData so you can add a JSON string:
  public void addData(String json) 
  {
    try{
    stringEntity = new StringEntity(json);
    } catch( Exception e ) { 
      e.printStackTrace(); 
    }
  }

  public void addFile(String name, File f) {
    nameFilePairs.put(name, f);
  }

  public void addFile(String name, String path) {
    File f = new File(path);
    nameFilePairs.put(name, f);
  }

  public void send() 
  {
    try {
      DefaultHttpClient httpClient = new DefaultHttpClient();
      HttpPut httpPut = new HttpPut(url);

      if (creds != null) {
        httpPut.addHeader(new BasicScheme().authenticate(creds, httpPut, null));
      }

      if (nameFilePairs.isEmpty()) {
        httpPut.setEntity(new UrlEncodedFormEntity(nameValuePairs, encoding));
      } else {
        MultipartEntity mentity = new MultipartEntity();  
        Iterator<Entry<String, File>> it = nameFilePairs.entrySet().iterator();
        while (it.hasNext()) {
          Entry<String, File> pair =  it.next();
          String name = (String) pair.getKey();
          File f = (File) pair.getValue();
          mentity.addPart(name, new FileBody(f));
        }        
        for (NameValuePair nvp : nameValuePairs) {
          mentity.addPart(nvp.getName(), new StringBody(nvp.getValue()));
        }
        httpPut.setEntity(mentity);
      }

      if (stringEntity != null) {
        httpPut.setEntity(stringEntity);
      }

      Iterator<BasicNameValuePair> headerIterator = headerPairs.iterator();
      while (headerIterator.hasNext()) {
        BasicNameValuePair headerPair = headerIterator.next();
        httpPut.addHeader(headerPair.getName(), headerPair.getValue());
      }

      response = httpClient.execute( httpPut );
      HttpEntity   entity   = response.getEntity();
      this.content = EntityUtils.toString(response.getEntity());

      if ( entity != null ) EntityUtils.consume(entity);

      httpClient.getConnectionManager().shutdown();

      // Clear it out for the next time
      nameValuePairs.clear();
      nameFilePairs.clear();
      headerPairs.clear();
    } 
    catch( Exception e ) { 
      e.printStackTrace();
    }
  }
  /* Getters
   _____________________________________________________________ */

  public String getContent()
  {
    return this.content;
  }

  public String getHeader(String name)
  {
    Header header = response.getFirstHeader(name);
    if (header == null)
    {
      return "";
    } else
    {
      return header.getValue();
    }
  }
}
