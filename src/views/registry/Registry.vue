<template>
  <div>
    <div class="form">
      <Form ref="form" :rules="rules" :model="userInfo">
        <FormItem key="registryUserName" prop="userName">
          <Input v-model="userInfo.userName" prefix="ios-contact" placeholder="请输入用户名" style="width: 100%"/>
        </FormItem>
        <FormItem key="registryIdCard" prop="idCard">
          <Input v-model="userInfo.idCard" prefix="md-finger-print" placeholder="请输入身份证号码"
                 style="width: 100%"/>
        </FormItem>
        <FormItem key="registryBtns">
          <Button type="primary" @click="handleSubmit('form')">注 册</Button>
          <Button style="margin-left: 18px;" type="dashed" @click="breakView" ghost>返回登录</Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Emit, Prop, Vue} from "vue-property-decorator";

  import {Button, Form, FormItem, Input, Notice, Modal} from "view-design";
  import {UserInfo} from "@/types";
  import {loginPath, registryPath} from '@/const/routerConsts';
  import {registry} from "@/api";
  import {sendAjax} from "@/api/axios/request";

  @Component({
    components: {
      Form, FormItem, Input, Button, Notice, Modal
    }
  })
  export default class Registry extends Vue {

    @Prop({required: true, type: String})
    private urlPrefix!: string;

    private userInfo: UserInfo = {
      userName: "",
      idCard: ""
    } as UserInfo;

    private rules: any = {
      userName: [
        {required: true, message: "用户名不能为空", trigger: 'change'}
      ],
      idCard: [
        {required: true, message: "身份证号码不能为空", trigger: 'change'},
        {pattern: /^[0-9]{17}([0-9]|x|X)$/, message: "身份证号码必须为18位且只能为数字或x"}
      ]
    };

    mounted() {
      this.sendViewName()
    }

    private handleSubmit(name: string) {
      (this.$refs[name] as Form).validate(async valid => {
        // if (!valid) {
        //   return
        // }

        const userName = this.userInfo.userName;
        const idCode = this.userInfo.idCard;
        try {
          await sendAjax(registry(this.urlPrefix, {
            userName,
            idCode
          }));

          (Modal as any).success({
            title: "注册成功",
            content: "注册成功, 初始密码: 12345678, 请使用 用户名+密码 登录门户系统"
          });

          this.userInfo = {
            userName: "",
            idCard: "",
            password: ""
          }

        } catch (e) {

          let content = "服务器异常,请稍后再试!";
          let title = "服务器异常";
          if (e.data && e.data.msg) {
            content = e.data.msg;
            title += "( " + e.data.code + " )"
          }
          (Notice as any).error({
            title: title,
            desc: content,
            duration: 0
          });
        }

      })
    }

    @Emit("sendViewName")
    sendViewName() {
      return registryPath
    }

    @Emit("breakView")
    breakView() {
      return loginPath
    }

  }
</script>

<style scoped>

</style>
