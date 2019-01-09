# -*- coding: utf-8 -*-

"""
Module implementing MainWindow.
"""
from PyQt5 import QtWidgets
from PyQt5.QtCore import pyqtSlot, QDir
from PyQt5.QtWidgets import QMainWindow, QMessageBox,  QFileDialog
from myConfig import *
import os
import subprocess

from Ui_test import Ui_MainWindow

class MainWindow(QMainWindow, Ui_MainWindow):
    """
    Class documentation goes here.
    """
    def __init__(self, parent=None):
        """
        Constructor
        
        @param parent reference to the parent widget
        @type QWidget
        """
        super(MainWindow, self).__init__(parent)
        self.setupUi(self)
    
    @pyqtSlot()
    def on_Button_Install_clicked(self):
        """
        Slot documentation goes here.
        """
        # TODO: not implemented yet
        #raise NotImplementedError
        file1 = QDir.currentPath()+"/setup.exe"
        if os.path.exists(file1) == False:
            QMessageBox.information(self,("错误"),("缺少安装程序："+file1))
            return
        input = QDir.currentPath()+"/install.xml"
        output = QDir.currentPath()+"/play.xml"
        if os.path.exists(input) == False:
            QMessageBox.information(self,("错误"),("缺少配置文件："+input))
            return

        if len(self.LE_WebURL.text()) <= 0:
            QMessageBox.information(self,("警告"),("认证网站没有输入"))
            return
        if len(self.LE_UserName.text()) <= 0:
            QMessageBox.information(self,("警告"),("用户名称没有输入"))
            return
        if len(self.LE_Passwd.text()) <= 0:
            QMessageBox.information(self,("警告"),("密码没有输入"))
            return
        if len(self.LE_InstallPath.text()) <= 0:
            QMessageBox.information(self,("警告"),("安装路径没有输入，将采用缺省路径"))

        cv = CV_Config()
        cv.setInfo(self.LE_UserName.text(), self.LE_Passwd.text(), self.LE_InstallPath.text(), self.LE_WebURL.text())
        if cv.checkInfo() == False:
            QMessageBox.information(self,("错误"),( cv.msg ))
            return
        if cv.writeInstallXMLFile(input,  output) == False:
            QMessageBox.information(self,("错误"),("无法生成配置文件:" + cv.msg ))
            return

        command = file1 + " /silent /play " + output
        QMessageBox.information(self,("安装即将开始"),("可能需要花费较长时间，请等待" ))
        QMessageBox.information(self,("安装命令"),(command))
        s = subprocess.Popen(str(command), stderr=subprocess.PIPE, stdout=subprocess.PIPE)
        (stdoutinfo, stderrinfo) = s.communicate()
        if s.returncode != 0:
            QMessageBox.information(self,("安装失败"),(str(stderrinfo)))
            return

        if cv.addRecord() == False:
            QMessageBox.information(self,("错误"),("无法注册主机:" + cv.msg ))
            retrun

        QMessageBox.information(self,("提示"),("安装和注册成功"))
        self.close()
    
    @pyqtSlot()
    def on_Button_Cancel_clicked(self):
        """
        Slot documentation goes here.
        """
        # TODO: not implemented yet
        #raise NotImplementedError
        self.close()

    @pyqtSlot()
    def on_Button_Browse_clicked(self):
        """
        Slot documentation goes here.
        """
        # TODO: not implemented yet
        #raise NotImplementedError
        directory = QFileDialog.getExistingDirectory(self, "安装路径选择", QDir.currentPath())

        if directory:
            self.LE_InstallPath.setText(directory)
            return

    @pyqtSlot()
    def on_Button_Register_clicked(self):
        """
        Slot documentation goes here.
        """
        # TODO: not implemented yet
        #raise NotImplementedError
        if len(self.LE_WebURL.text()) <= 0:
            QMessageBox.information(self,("警告"),("认证网站没有输入"))
            return
        if len(self.LE_UserName.text()) <= 0:
            QMessageBox.information(self,("警告"),("用户名称没有输入"))
            return
        if len(self.LE_Passwd.text()) <= 0:
            QMessageBox.information(self,("警告"),("密码没有输入"))
            return
        cv = CV_Config()
        cv.setInfo(self.LE_UserName.text(), self.LE_Passwd.text(), self.LE_InstallPath.text(), self.LE_WebURL.text())
        if cv.addRecord() == False:
            QMessageBox.information(self,("错误"),("无法注册主机:" + cv.msg ))
            return

        QMessageBox.information(self,("提示"),("注册成功" ))
        self.close()



if __name__ == "__main__":
    import sys

    app = QtWidgets.QApplication(sys.argv)
    win = MainWindow()
    win.show()
    sys.exit(app.exec_())

