#include <SPI.h>
#include <Ethernet.h>
#include <Client.h>


#define PORT 40101


byte buf[10];
word chksum = 0;
word rxchksum;

byte mac[] = {0x90, 0xA2, 0xDA, 0x00, 0x44, 0xF0 };
byte ip[] = {192,168,0,150};
byte gateway[] = {192,168,0,1}; 
byte server[] = {192,168,0,157}; //{78,109,85,94};
byte subnet[] = { 255, 255, 255, 0 };
Client client(server, PORT);



char buffer[50];

long debounceDelay = 2000;
long lastDebounceTime = 0;

int SwitchPrevious = 9;

int sentPacket = 0;

void setup()
{
   
  
  pinMode(9, INPUT);
  digitalWrite(9, HIGH);       // turns on pull-up resistor after input
  
  pinMode(10, INPUT);
  digitalWrite(10, HIGH);       // turns on pull-up resistor after input
 
  pinMode(11, INPUT);
  digitalWrite(11, HIGH);       // turns on pull-up resistor after input
   
  Serial.begin(9600);
  Ethernet.begin(mac, ip); //, gateway,subnet);  
    
}


void loop()
{
  
  if (SwitchPrevious!=9) { 
    if (digitalRead(9) == LOW ) {
       
      SwitchPrevious = 9;
      
      Serial.println("Sending packet OFF ..."); 
      joshPost("off",10);
    }
  }
  
  if (SwitchPrevious!=10) {
    if (digitalRead(10) == LOW) {
       
      SwitchPrevious = 10;
      
      Serial.println("Sending packet ON ..."); 
      joshPost("on",10);
    }
  }
  
  if (lastDebounceTime+debounceDelay<millis()) {
      
    if (digitalRead(11) == LOW) {
       
      lastDebounceTime = millis();
      
      Serial.println("Sending packet NEXT ..."); 
      joshPost("next",10);
    }
  }
}




int joshPost(String cmd, int retries)
{
  
  Serial.println("retry");
  Serial.println(retries);

  if (client.connect()) 
  {
    //sprintf(buffer,"{\"event\" : \"%x\"}",1);
    //buffer = 
    client.print("POST /message");
    client.print(" HTTP/1.1\nHost: ");
    client.println("joshfire.com"); //change
    client.println("Content-Type:application/json");
    client.print("Content-Length: ");
    client.println(cmd.length(),DEC); //buffer),DEC);
    client.println();
    client.println(cmd); //buffer);
    client.println();
    
    sentPacket=1;
    
    long timeRef = millis();
    while(client.available()<1)
    {
      
      if ((millis() - timeRef) > 5000)
      {
        client.stop();
        return -1; 
      }
    }
    
    while(client.available()>0)
    {
     Serial.print(client.read(),BYTE); 
    }
    client.stop();
    return 1;
    
  }
  else
  {
    
    if (retries>0) {
      delay(200);
      joshPost(cmd,retries-1);
    } else {
      return -1;
    } 
  }

  
}
