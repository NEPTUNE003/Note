1.下载vscode。为了方便管理，点击左下角设置，点击配置文件，重新创立一个配置文件并命名。

2.在官网（ https://dl.espressif.com/dl/esp-idf/ ）下载 esp-idf-tools-setup-offline-5.1.2.exe 文件，右键以管理员身份运行，安装。
![[d2ac1cae258d7055065905bc8aedf2bb.png|400]]
最后弹出该窗口，即esp-idf-tools-setup-offline-5.1.2安装完成，桌面也会多两个ESP_IDF的CMD和POWERSHELL快捷方式。
![[Pasted image 20260401031201.png|400]]
点击PowerShell，  “Done! You can now compile ESP-IDF projects.
Go to the project directory and run:  idf.py build ”  ，看到最后有这样一串英文，成功配置。

3.打开vscode，点击左侧栏扩展选项，搜索ESPIDF，选择第一个，安装。
点击F1，在最上面中间输入ESP-IDF: Configure ESP-IDF extension，点击EXPRESS。
![[ed787715e63ec39e607ed443cc37f5d8.png|400]]
如图选择路径。
![[Pasted image 20260401031321.png|400]]
等待安装。
![[Pasted image 20260401031747.png|400]]
配置完成，左下角显示ESP_IDF版本号，自行选择COM口、ESP32型号。