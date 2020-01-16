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
  </div>
</template>

<script lang="ts">
  import {Component, Emit, Prop, Vue} from "vue-property-decorator";
  import {Button, Form, FormItem, Input, Radio, RadioGroup, Notice, Spin} from "view-design";
  import {UserInfo} from "@/types";

  import {loginPath, registryPath} from "@/const/routerConsts";
  import {sendAjax} from "@/api/axios/request";
  import {login} from "@/api";
  import md5 from "md5";

  @Component({
    components: {
      RadioGroup, Radio, Input, Form, FormItem, Button, Spin
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

    private showLoading: boolean = false;

    private loadingText: string = '';

    private rules: any = {
      userName: [
        {required: true, message: "用户名不能为空", trigger: 'change'}
      ],
      password: [
        {required: true, message: '密码不能为空', trigger: 'change'},
        {type: 'string', min: 8, message: '密码不能少于8位', trigger: 'change'}
      ]
    };

    handleSubmit(name: string) {
      (this.$refs[name] as Form).validate(async valid => {
        if (!valid) {
          return
        }
        this.showLoading = true;
        this.loadingText = "正在登录...";

        const userName = this.userInfo.userName;
        const password = md5(this.userInfo.password);

        try {
          const response = await sendAjax(login(this.urlPrefix, {
            userName,
            password
          }));
          this.loadRemoteComponent();

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

    private loadRemoteComponent() {

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
