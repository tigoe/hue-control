
# Connecting Through Curl

You can connect to your Hue hub using a command line interface as well, with the curl program, as mentioned above. For example, here's how you'd create a new user using curl:

Enter the following on the command line, replacing $ADDR with your hub's IP address:

````
$ curl -X POST -d '{"devicetype":"my app"}' http://$ADDR/api
````

You can use any value you want for devicetype. Press the link button on the hub BEFORE YOU HIT ENTER on this command, then hit enter. You should get a response like this:

````
[
    {
        "success": {
            "username": "newusername"
        }
    }
]
````


Now you're ready to write code for your hub. Regardless of what environment you're programming in, you'll use the username you established here.
