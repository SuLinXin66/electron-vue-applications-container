<template>
  <div>
    <div class="form">
      <Form ref="form" :rules="rules" :model="userInfo">
        <FormItem key="loginUserName" prop="userName">
          <Input v-model="userInfo.userName" prefix="ios-contact" placeholder="请输入用户名/身份证号" style="width: 100%"/>
        </FormItem>
        <FormItem key="loginUserP" prop="password">
          <Input v-model="userInfo.password" prefix="md-finger-print" type="password" password placeholder="请输入密  码"
                 style="width: 100%"/>
        </FormItem>
        <FormItem key="loginBtns">
          <Button type="primary" @click="handleSubmit('form')">登 录</Button>
          <Button style="margin-left: 18px;" type="dashed" @click="breakView" ghost>注 册</Button>
        </FormItem>
      </Form>
    </div>
    <div v-show="showLoading" class="zhe-dang">
      <Spin size="large" fix/>
      <span class="loading-text">{{loadingText}}</span>
    </div>
    <Modal :closable="false"
           :styles="{top: '38px'}"
           :mask-closable="false"
           :loading="true" v-model="showChangPasswordModal" width="360">
      <p slot="header" style="color:#2db7f5;text-align:center">
        <Icon type="ios-key-outline"/>
        <span>请修改您的密码</span>
      </p>
      <div style="text-align:center">
        <Form ref="changeForm" :rules="rules" :model="changData">
          <FormItem key="oldPassword" prop="oldPwd">
            <Input v-model="changData.oldPwd" type="password" password prefix="md-finger-print" placeholder="请输入密  码"
                   style="width: 100%"/>
          </FormItem>
          <FormItem key="newPassword" prop="newPwd">
            <Input v-model="changData.newPwd" type="password" password prefix="md-finger-print" placeholder="请确认密  码"
                   style="width: 100%"/>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="showChangPasswordBtnLoading" @click="changePasswordBtnClick">
          确定
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
  import {Component, Emit, Prop, Vue} from "vue-property-decorator";
  import {Button, Form, FormItem, Input, Radio, RadioGroup, Notice, Spin, Icon, Modal} from "view-design";
  import {DbSystem, EventReturn, RemoteEventNames, SystemEventNames, UserInfo, UserLocalEventNames} from "@/types";

  import {loginPath, registryPath} from "@/const/routerConsts";
  import {sendAjax} from "@/api/axios/request";
  import {login, ping, queryComponents, updateUserPwd} from "@/api";
  import md5 from "md5";
  import {ComponentVo} from "@/views/login/types";

  @Component({
    components: {
      RadioGroup, Radio, Input, Form, FormItem, Button, Spin, Icon, Modal
    }
  })
  export default class Login extends Vue {

    @Prop({required: true, type: String})
    private userType!: string;

    @Prop({required: true, type: String})
    private urlPrefix!: string;

    private userInfo: UserInfo = {
      userName: "",
      password: ""
    } as any;

    private showChangPasswordModal: boolean = false;

    private showChangPasswordBtnLoading: boolean = false;

    private changData = {
      oldPwd: '',
      newPwd: '',
    };

    private showLoading: boolean = false;

    private loadingText: string = '';

    private serverUser: UserInfo = {} as any;

    private rules: any = {
      userName: [
        {required: true, message: "用户名不能为空", trigger: 'change'}
      ],
      password: [
        {required: true, message: '密码不能为空', trigger: 'change'},
        {type: 'string', min: 8, message: '密码不能少于8位', trigger: 'change'}
      ],
      newPwd: [
        {required: true, message: '密码不能为空', trigger: 'change'},
        {type: 'string', min: 8, message: '密码不能少于8位', trigger: 'change'}
      ],
      oldPwd: [
        {required: true, message: '密码不能为空', trigger: 'change'},
        {type: 'string', min: 8, message: '密码不能少于8位', trigger: 'change'}
      ]
    };

    private changePasswordBtnClick() {
      (this.$refs["changeForm"] as Form).validate(async valid => {
        if (!valid) {
          return
        }
        if (this.changData.newPwd !== this.changData.oldPwd) {
          (Modal as any).error({
            title: "错误提醒",
            content: "旧密码和新密码不一致，请检查后重试!"
          });
          return;
        }

        if (this.changData.newPwd == "123456789") {
          (Modal as any).error({
            title: "错误提醒",
            content: "新密码不能设置为初始密码"
          });
          return;
        }

        this.showChangPasswordBtnLoading = true;
        try {
          const response = await sendAjax(updateUserPwd(this.urlPrefix, {
            userName: this.serverUser.userName as any,
            oldPwd: this.serverUser.password as any,
            newPwd: md5(this.changData.newPwd as any)
          }));

          if (!response.data || response.data.error || !response.data.result) {
            (Notice as any).error({
              duration: 0,
              desc: "密码修改失败, 请稍后重新尝试！",
              title: '错误提醒'
            });
            return
          }

          this.showChangPasswordBtnLoading = false;
          this.showLoading = true;
          this.showChangPasswordModal = false;

          this.loadRemoteComponent();

        } catch (e) {
          this.showChangPasswordBtnLoading = false;
          let title = "修改密码失败";
          let content = "服务器异常,请稍后重新尝试";
          if (e.code == 12) {
            content = "连接服务器失败, 请检查您配置的地址是否正确"
          } else if (e.data.msg) {
            title += "( " + e.data.code + " )";
            content = e.data.msg;
          }

          (Notice as any).error({
            duration: 0,
            desc: content,
            title
          })
        }


      });
    }

    handleSubmit(name: string) {
      (this.$refs[name] as Form).validate(async valid => {
        if (!valid) {
          return
        }
        this.showLoading = true;
        this.loadingText = "正在登录...";

        const userName = this.userInfo.userName;
        const password = md5(this.userInfo.password as string);

        try {
          const response = await sendAjax(login(this.urlPrefix, {
            userName,
            password
          }));
          const userData: UserInfo = response.data.result;
          this.serverUser = userData;
          this.serverUser.password = password;
          if (userData.firstLogin || password == md5("123456789")) {
            this.showChangPasswordModal = true;
            this.showLoading = false;
            return;
          }

          await this.loadRemoteComponent();

        } catch (e) {
          this.showLoading = false;
          let title = "登录失败";
          let content = "请稍后重新尝试";
          if (e.code == 12) {
            content = "连接服务器失败, 请检查您配置的地址是否正确"
          } else if (e.data.msg) {
            title += "( " + e.data.code + " )";
            content = e.data.msg;
          }

          (Notice as any).error({
            duration: 0,
            desc: content,
            title
          })
        }
      });
    }

    private async loadRemoteComponent() {
      this.loadingText = "获取组件状态...";
      let response = await sendAjax(queryComponents(this.urlPrefix));
      const result: Array<ComponentVo> = response.data.result;
      if (!result || !result.length) {
        (Notice as any).error({
          duration: 0,
          desc: "获取组件失败",
          title: '错误提醒'
        });
        this.showLoading = false;
        return;
      }

      // let checkSuccess = [];
      let loadServe: any = {
        socketUrl: {
          desc: "消息服务",
          required: true
        },
        chatMain: {
          desc: "通信主题",
          required: true
        },
        chatMessage: {
          desc: "通信消息",
          required: true
        },
        chatHistory: {
          desc: "通信历史",
          required: true
        },
        appsUrl: {
          desc: "应用列表",
          required: true
        },
        floatTray: {
          desc: "悬浮托盘服务",
          required: false
        },
        length: 6
      };
      for (let componentVo of result) {
        const currCheckComponent = loadServe[componentVo.name];
        if (!currCheckComponent) {
          continue;
        }
        let successNum = 0;
        if ((!componentVo.Urls || !componentVo.Urls.length || componentVo.Urls.length == 0) && currCheckComponent.required) {
          console.log(componentVo);
          (Notice as any).error({
            duration: 0,
            desc: `组件 => ${componentVo.title}, 获取失败, 请联系总控系统管理员，检查现在组件的状态!`,
            title: '错误提醒'
          });
          this.showLoading = false;
          return;
        }

        this.loadingText = "检测组件是否可用...";
        for (let url of componentVo.Urls) {
          try {
            const tmpRes = await sendAjax(ping(url.url));
            if (tmpRes.status == 200 && !tmpRes.data.error && tmpRes.data.result == "pong") {
              successNum += 1;
              const dbRes: EventReturn<any> = this.electronIpcRenderer.sendSync(SystemEventNames.saveComponent, {
                url: url.url,
                desc: componentVo.title,
                localType: componentVo.name
              } as DbSystem);
              if (dbRes.error && currCheckComponent.required) {
                (Notice as any).error({
                  duration: 0,
                  desc: `保存组件错误 => ${dbRes.result}`,
                  title: '错误提醒'
                });
                this.showLoading = false;
                return;
              }
            }
          } catch (e) {

          }

        }

        if (successNum == 0) {
          (Notice as any).error({
            duration: 0,
            desc: `组件 => ${componentVo.title}, 服务不正常, 请联系总控系统管理员，检查现在组件服务的状态!`,
            title: '错误提醒'
          });
          this.showLoading = false;
          return;
        }
        delete loadServe[componentVo.name];
        loadServe.length -= 1;
      }

      console.log(loadServe);

      // if (checkSuccess.length != 5) {
      //   (Notice as any).error({
      //     duration: 0,
      //     desc: `必备组件缺失, 系统无法运行, 请联系总控系统管理员，检查现在组件的状态!`,
      //     title: '错误提醒'
      //   });
      //   this.showLoading = false;
      //   return;
      // }

      this.loadingText = "初始化组件中...";
      this.electronIpcRenderer.removeListener(RemoteEventNames.loginLoading, this.loginLoading);
      this.electronIpcRenderer.on(RemoteEventNames.loginLoading, this.loginLoading);
      this.electronIpcRenderer.send(UserLocalEventNames.loginOk, this.serverUser)


    }

    mounted() {
      this.sendViewName()
    }

    @Emit("sendViewName")
    sendViewName() {
      return loginPath
    }

    @Emit("breakView")
    breakView() {
      return registryPath;
    }

    private loginLoading(event: any, args: EventReturn<string>) {
      console.log(args)
      if (args.error) {
        (Modal as any).error({
          title: "错误提醒",
          content: `组件加载失败 ==> ${args.err!.message}`
        });
        this.loadingText = "";
        this.showLoading = false;
        return
      }
      this.loadingText = args.result as string
    }

  }
</script>

<style lang="less" scoped>
  .zhe-dang {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -60px;
    top: -60px;

    .loading-text {
      display: block;
      position: absolute;
      top: 56%;
      font-size: 18px;
      font-weight: bold;
      z-index: 9;
      text-align: center;
      width: 100%;
    }
  }
</style>
