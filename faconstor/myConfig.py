# -*- coding: utf-8 -*-
import os
import requests
import json
try: 
    import xml.etree.cElementTree as ET 
except ImportError: 
    import xml.etree.ElementTree as ET 

class CV_Config(object):
    """
    Class documentation goes here.

    """
    def __init__(self):
        super(CV_Config, self).__init__()
        self.localhost = self._getHostName()
        self.webURL = ""
        self.userName = ""
        self.passwd =""
        self.installPath = ""
        self.cs = ""
        self.csHost = ""
        self.service = ""
        self.client = ""
        self.msg = ""
  
    def setInfo(self,  userName,  passwd,  installPath,  webURL):
        self.client = self.localhost
        self.userName = userName
        self.passwd = passwd
        self.installPath = installPath
        self.webURL = webURL
        return
        
    def writeInstallXMLFile(self,  input, output):  
        try: 
            tree = ET.parse(input)
            root = tree.getroot()
        except : 
            self.msg =  "Error:parse file: " +input
            return False 
        try:
            cs = root.findall(".//CommserveHostInfo")
            cs[0].attrib["clientName"] = self.cs
            cs[0].attrib["hostName"] = self.csHost
            client = root.findall(".//clientEntity")
            client[0].attrib["hostName"] = self.localhost
            client[0].attrib["clientName"] = self.client + "." + self.userName
            path = root.findall(".//client")
            path[0].attrib["installDirectory"] = self.installPath
        except:
            self.msg = "Error: xml file is wrong" + input
            return False 
        try: 
            tree.write(output)
        except : 
            self.msg =  "Error:write file: " +  output
            return False 
        return True
    
    def checkInfo(self):
        loginReq = 'http://<<server>>/checkPhyClient?username=<<username>>&password=<<password>>&clientName=<<clientName>>'
        loginReq = loginReq.replace("<<server>>", self.webURL)
        loginReq = loginReq.replace("<<username>>", self.userName) 
        loginReq = loginReq.replace("<<password>>", self.passwd)
        loginReq = loginReq.replace("<<clientName>>", self.client)
        self.sendText = loginReq
        try:
            r = requests.get(loginReq, headers=None)
        except:
            self.msg = "login failure: did not connect webaddr: " + self.webURL
            return False
        if r.status_code == 200:
            res = json.loads(r.text)
            if res["value"] == "1":
                self.msg = "login success"
                self.cs = res["clientName"]
                self.csHost = res["hostName"]
                return True
            self.msg = u"错误信息: " + res["text"]
        else:
            self.msg = "login failure: did not connect webaddr: " + self.webURL
        return False
    
    def addRecord(self):
        loginReq = 'http://<<server>>/addPhyClient?username=<<username>>&password=<<password>>&clientName=<<clientName>>&vendor=commvault&zone=Zone001'
        loginReq = loginReq.replace("<<server>>", self.webURL)
        loginReq = loginReq.replace("<<username>>", self.userName) 
        loginReq = loginReq.replace("<<password>>", self.passwd)
        loginReq = loginReq.replace("<<clientName>>", self.client)

        self.sendText = loginReq
        try:
            r = requests.get(loginReq, headers=None)
        except:
            self.msg = "login failure: did not connect webaddr: " + self.webURL
            return False
        if r.status_code == 200:
            res = json.loads(r.text)
            if res["value"] == u"1":
                self.msg = "add rec success"
                return True
            self.msg = u"错误信息: " + res["text"]
        else:
            self.msg = "login failure: did not connect webaddr: " + self.webaddr
        return False
        
    def _getHostName(self):  
        sys_platform = os.name  
        if sys_platform == 'nt':  
            hostname = os.getenv('computername')  
            return hostname  
  
        elif sys_platform == 'posix':  
                host = os.popen('echo $HOSTNAME')  
                try:  
                    hostname = host.read()  
                    return hostname  
                finally:  
                    host.close()  
        else:  
            return 'Unkwon hostname'
            
            
if __name__ == "__main__":
    '''
    print('it is main')
    input = "E:\INSTALL.XML"
    output = "E:\TEST.XML"
    cv = CV_Config()
    cv.setInfo("hzx", "1", "c:\\", "192.168.100.21")
    if cv.checkInfo() == True:
        print("success")
        print (cv.cs)
        print (cv.csHost)
        cv.addRecord()
        print (cv.msg)
        
    else:
        print("faliure")
        print (cv.msg)

    '''
    #cv.writeInstallXMLFile(input, output)

  
