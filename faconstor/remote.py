"""
paramiko, pywinrm实现windows/linux脚本调用
linux下脚本语法错误,或者命令不存在等没有通过stderr变量接收到，只能添加判断条件；
windows下可以接收到错误信息并作出判断；
"""
import paramiko
import winrm
import json
from paramiko import py3compat

class ServerByPara(object):
    def __init__(self, cmd, host, user, password, system_choice):
        self.cmd = cmd
        self.client = paramiko.SSHClient()
        self.host = host
        self.user = user
        self.pwd = password
        self.system_choice = system_choice

    def exec_linux_cmd(self, succeedtext):
        data_init = ''
        self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        try:
            self.client.connect(hostname=self.host, username=self.user, password=self.pwd)
        except:
            print("连接服务器失败")
            return {
                "exec_tag": 1,
                "data": "连接服务器失败",
                "log": "连接服务器失败",
            }
        try:
            stdin, stdout, stderr = self.client.exec_command(self.cmd, get_pty=True)
        except:
            print("脚本执行超时")
            return {
                "exec_tag": 1,
                "data": "脚本执行超时",
                "log": "脚本执行超时",
            }
        if stderr.readlines():
            exec_tag = 1
            for data in stderr.readlines():
                data_init += data
            log = ""
        else:
            exec_tag = 0
            log = ""

            try:
                for data in stdout.readlines():
                    data_init += data

                if "command not found" in data_init:  # 命令不存在
                    exec_tag = 1
                    log = "命令不存在"
                elif "syntax error" in data_init:  # 语法错误
                    exec_tag = 1
                    log = "语法错误"
                elif "No such file or directory" in data_init:  # 脚本不存在
                    exec_tag = 1
                    log = "脚本不存在"
                elif succeedtext is not None:
                    if succeedtext not in data_init:
                        exec_tag = 1
                        log = "未匹配"
            except:
                exec_tag = 0  # 不抛错
                log = "编码错误"
                data_init = "编码错误"

        return {
            "exec_tag": exec_tag,
            "data": data_init,
            "log": log,
        }

    def exec_win_cmd(self, succeedtext):
        data_init = ""
        log = ""

        try:
            s = winrm.Session(self.host, auth=(self.user, self.pwd))
            ret = s.run_cmd(self.cmd)
        except:
            print("连接服务器失败")
            return {
                "exec_tag": 1,
                "data": "连接服务器失败",
                "log": "连接服务器失败",
            }

        if ret.std_err.decode():
            exec_tag = 1
            for data in ret.std_err.decode().split("\r\n"):
                data_init += data
            log = ""
        else:
            exec_tag = 0
            for data in ret.std_out.decode().split("\r\n"):
                data_init += data
            if succeedtext is not None:
                if succeedtext not in data_init:
                    exec_tag = 1
                    log = "未匹配"
        return {
            "exec_tag": exec_tag,
            "data": data_init,
            "log": log,
        }

    def run(self, succeedtext):
        if self.system_choice == "Linux":
            result = self.exec_linux_cmd(succeedtext)
        else:
            result = self.exec_win_cmd(succeedtext)
        print(result)
        return result

# if __name__ == '__main__':
# server_obj = ServerByPara(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
#     server_obj = ServerByPara(r"C:\Users\Administrator\Desktop\test_python.bat", "192.168.100.151", "administrator","tesunet@2017", "Windows")
# server_obj = ServerByPara(r"/root/Desktop/test06.sh hello", "47.95.195.90", "root","!zxcvbn123", "Linux")
#     server_obj = ServerByPara(r"cat /root/Desktop/script_log.txt", "47.95.195.90", "root","!zxcvbn123", "Linux")
#
    # server_obj.run("")
