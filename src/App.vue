<template>
  <div>
    <div class="drop" @mousedown="mousedown($event)">
      <i @click="toShowModal" class="iconfont icon-shezhi" title="设置"/>
      <i @click="closeApp" class="iconfont icon-close" title="关闭"/>
    </div>
    <div id="app">
      <h1 class="login-title">{{title}}</h1>
      <RadioGroup style="width: 100%; text-align:center; margin-bottom: 18px;" size="large" v-model="userType">
        <Radio label="用户名和密码"/>
        <Radio title="暂不支持使用USBKey登录" label="USBKey" disabled/>
      </RadioGroup>
      <router-view :urlPrefix="settingsData.url" :userType="userType" @sendViewName="changeTitle"
                   @breakView="breakView"/>
    </div>
    <Modal
      ref="modal"
      v-model="showModal"
      title="系统设置"
      :closable="false"
      :mask-closable="false"
      :loading="true"
      :styles="{top: '28px'}"
      @on-ok="handleSettingModal"
    >
      <Form :model="settingsData" :label-width="120">
        <FormItem :label="settingsData.label">
          <Input v-model="settingsData.url" placeholder="主控系统的URL"/>
        </FormItem>
        <FormItem label="是否自动登录">
          <ISwitch v-model="settingsData.autoLogin" size="large">
            <span slot="open">开启</span>
            <span slot="close">关闭</span>
          </ISwitch>
        </FormItem>
      </Form>
    </Modal>
  </div>

</template>

<script lang="ts">

  import {Component, Vue} from 'vue-property-decorator';

  import {Radio, RadioGroup, Modal, Form, FormItem, Input, Switch, Notice} from 'view-design';

  import {registryPath} from '@/const/routerConsts';
  import {DbParams, DbSystem, DbUserLocal, EventReturn, SystemEventNames, UserLocalEventNames} from "@/types";

  const loginTitle = '欢迎使用门户系统';
  const registryTitle = '会员注册';
  const userPType = '用户名和密码';
  const userUType = 'USBKey';

  @Component({
    components: {
      RadioGroup, Radio, Modal, Form, FormItem, Input, ISwitch: Switch
    }
  })
  export default class App extends Vue {

    private showModal: boolean = false;

    private title: string = loginTitle;

    private userType: string = userPType;

    private isSettingOk: boolean = true;

    private settingsData: any = {
      url: '',
      label: '',
      autoLogin: true,
      id: '',
      userLocalId: ''
    };

    private created(){
      this.loadUserLocalSetting()
    }

    private mousedown(e: any) {
      const remote = this.electronRemote;
      const currWindowPosition = remote.getCurrentWindow().getPosition();
      let formX = e.screenX - currWindowPosition[0];
      let formY = e.screenY - currWindowPosition[1];
      document.onmousemove = function (e) {
        remote.getCurrentWindow().setPosition((e.screenX - formX), (e.screenY - formY));
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      }
    }

    breakView(path: string) {
      const nowPath = this.$route.path;
      if (nowPath === path) {
        return
      }

      this.userType = userPType;

      this.title = path == registryPath ? registryTitle : loginTitle;
      this.$router.replace(path);
    }

    changeTitle(path: string) {
      this.title = path === registryPath ? registryTitle : loginTitle
    }

    private closeApp() {
      this.electronRemote.app.quit()
    }


    private toShowModal() {
      this.loadUserLocalSetting();
      this.showModal = true
    }

    private loadUserLocalSetting(isCreated?: any){
      const data: EventReturn<DbSystem> = this.electronIpcRenderer.sendSync(SystemEventNames.findOne, {localType: "mainSystemUrl"} as DbSystem);

      const userLocalData: EventReturn<DbUserLocal> = this.electronIpcRenderer.sendSync(UserLocalEventNames.findOne, {key: "autoload"});
      if (data.error || userLocalData.error) {

        if (isCreated) {
          this.electronRemote.dialog.showMessageBoxSync({
            title: "错误提醒",
            message: "无法获取当前配置信息, 请稍后再试",
            type: "error"
          });
          this.electronRemote.app.quit();
        } else {
          (Modal as any).error({
            title: "错误提醒",
            content: "无法获取当前配置信息, 请稍后再试"
          });
        }
        return;
      }

      this.settingsData.autoLogin = userLocalData.result!.val;
      this.settingsData.label = data.result!.desc;
      this.settingsData.url = data.result!.url;
      this.settingsData.id = data.result!._id;
      this.settingsData.userLocalId = userLocalData.result!._id;
    }

    private handleSettingModal() {
      this.isSettingOk = false;
      const data: DbParams = {
        query: {
          _id: this.settingsData.id
        } as DbSystem,
        paramQuery: {
          $set: {
            url: this.settingsData.url
          }
        },
        options: {}
      };
      const userData: DbParams = {
        query: {
          _id: this.settingsData.userLocalId
        },
        paramQuery: {
          $set: {
            val: this.settingsData.autoLogin
          }
        },
        options: {}
      };
      const result: EventReturn<void> = this.electronIpcRenderer.sendSync(SystemEventNames.update, data);
      const userResult: EventReturn<void> = this.electronIpcRenderer.sendSync(UserLocalEventNames.update, userData);
      this.isSettingOk = true;
      this.showModal = false;
      if (result.error || userResult.error) {
        (Notice as any).error({
          title: "修改配置失败",
          desc: result.err!.message
        })
      }
    }

    private mounted() {
      (this.$refs["modal"] as any).close = () => {
        this.closeSettingModal();
      }
    }

    private closeSettingModal() {
      if (this.isSettingOk) {
        this.showModal = false;
        return
      }

    }

  }

</script>

<style lang="less">
  * {
    user-select: none;
  }

  #app {
    width: 600px;
    height: 300px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -300px;
    margin-top: -150px;
    /*overflow: hidden;*/
  }

  .drop {
    width: 100%;
    height: 38px;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    cursor: move;
    z-index: 1011;

    i {
      width: 38px;
      height: 38px;
      font-size: 18px;
      line-height: 38px;
      display: block;
      position: absolute;
      top: 5px;
      cursor: pointer;

      &:last-child {
        right: 0;
      }

      &:first-child {
        right: 38px;
      }

      &:hover {
        cursor: pointer;
        color: rgba(0, 0, 0, .5);
      }
    }
  }

  label:first-child {
    color: bisque;
  }

  .login-title {
    color: #fff;
    text-shadow: 0 0 10px;
    letter-spacing: 1px;
    text-align: center;
  }

  .form {
    width: 300px;
    margin: 0 auto;
  }
</style>
