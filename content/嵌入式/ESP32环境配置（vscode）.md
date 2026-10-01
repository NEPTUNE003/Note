1.下载vscode。为了方便管理，点击左下角设置，点击配置文件，重新创立一个配置文件并命名。

2.在官网（ https://dl.espressif.com/dl/esp-idf/ ）下载 esp-idf-tools-setup-offline-5.1.2.exe 文件，右键以管理员身份运行，安装。
![[ESP32环境配置（vscode）-01.png|600]]
最后弹出该窗口，即esp-idf-tools-setup-offline-5.1.2安装完成，桌面也会多两个ESP_IDF的CMD和POWERSHELL快捷方式。
![[ESP32环境配置（vscode）-02.png|600]]
点击PowerShell，  “Done! You can now compile ESP-IDF projects.
Go to the project directory and run:  idf.py build ”  ，看到最后有这样一串英文，成功配置。

3.打开vscode，点击左侧栏扩展选项，搜索ESPIDF，选择第一个，安装。
点击F1，在最上面中间输入ESP-IDF: Configure ESP-IDF extension，点击EXPRESS。
![[ESP32环境配置（vscode）-03.png|600]]
如图选择路径。
![[ESP32环境配置（vscode）-04.png|600]]
等待安装。
![[ESP32环境配置（vscode）-05.png|600]]
配置完成，左下角显示ESP_IDF版本号，自行选择COM口、ESP32型号。
