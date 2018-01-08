<template>
  <main>
    <section class="replay" v-if='data.Players'>
      <div class="graph" v-if="graphData">
        <ScatterChart :chart-data="graphData" class="chart"></ScatterChart>

        <div class="milestones">
          <span class="pog" v-for="m in milestones" :key="m.id" :style="{ left: m.pos }" :data-type="m.type" :data-faction="data.Players.Player[m.p].FactionId.txt"></span>
        </div>
      </div>

      <div class="rdata">
        <playerBlock v-for="player in players" :key="player.Identity.attr.Id" :player="player" :gevents="gevents"></playerBlock>
      </div>

    </section>

    <drop class="dzone" @drop="eatReplay">Gimmie a Replay...</drop>

    <div class="brand">
      <h1><img src="../assets/avw.png"> ReplayUltima™</h1>
    </div>
  </main>
</template>

<script>
import Vue from 'vue';
import { Drop } from 'vue-drag-drop';
import Convert from 'xml-js';

import Scatter from './Scatter';
import Player from './Player';

Vue.component('drop', Drop);

export default {
  name: 'Analyzer',
  components: {
    playerBlock: Player,
    ScatterChart: Scatter,
  },
  data() {
    return {
      data: {},
      graphData: null,
    };
  },
  computed: {
    players() {
      if (!this.data.Players) return false;
      return this.data.Players.Player.map((player) => {
        const p = player;
        p.Winner = this.data.Results.WinningTeam.txt;
        return p;
      });
    },
    gevents() { return this.data.GameEvents.g.map(e => e.attr); },
    milestones() {
      const m = [];
      const matchLen = parseInt(this.gevents[this.gevents.length - 1].t);
      let fk = false;
      let ft2 = false;
      let ft3 = false;

      for (let x = 0, gl = this.gevents.length; x < gl; x += 1) {
        const e = this.gevents[x];
        e.id = x;

        // Find the first kill
        if (e.e === 'Die' && !fk && e.t !== '8970' && !e.d.includes('farm')) {
          e.type = 'firstKill';
          m.push(e);
          fk = true;
        }
        // Find T3 kills
        if (e.e === 'Die' && e.d.match(/fox|owl|wolf|boar|badger/gi) && !e.d.includes('warren')) {
          e.type = 't3Kill';
          m.push(e);
        }
        // Find Expands
        if (e.e === 'Build' && e.d.match(/gristmill/gi)) {
          e.type = 'expand';
          m.push(e);
        }
        // First T2
        if (e.e === 'Produce' && !ft2 && e.d.match(/skunk|snak|ferr|chamel|falco/gi)) {
          e.type = 't2Build';
          m.push(e);
          ft2 = true;
        }
        // First T3
        if (e.e === 'Produce' && !ft3 && e.d.match(/fox|owl|wolf|boar|badger/gi)) {
          e.type = 't3Build';
          m.push(e);
          ft3 = true;
        }

        // Calculate position
        const pos = parseInt(e.t) / matchLen;
        e.pos = `${pos * 100}%`;
      }

      return m;
    },
  },
  methods: {
    eatReplay(d, ev) {
      // Return JSON of replay
      ev.preventDefault();
      const files = ev.dataTransfer.files;
      const read = new FileReader();
      this.data = {}; // Clear data

      read.onload = (e) => {
        const contents = e.target.result;
        const json = JSON.parse(Convert.xml2json(contents, {
          compact: true,
          spaces: 2,
          ignoreDeclaration: true,
          attributesKey: 'attr',
          textKey: 'txt',
        })).EventHistory;

        // Cleanup Large Input Junk we can't understand anyway
        delete json.History;

        // eslint-disable-next-line
        for (const prop in json) {
          this.$set(this.data, prop, json[prop]);
        }

        this.fillData();
      };

      // Read just one file
      read.readAsText(files.item(0));
    },
    fillData() {
      let p1 = 0;
      let p2 = 0;
      const colors = [];

      const t1 = ['lizard', 'squirrel', 'toad', 'pigeon'];
      const t3 = ['board', 'owl', 'fox', 'wolf', 'badger'];

      // eslint-disable-next-line
      const gData = this.gevents.filter( data => (data.e === 'Produce' || data.e === 'Die') && data.d !== 'pig' && !data.d.match(/warren|struct|farm|grist|command/gi)).map((e) => {
        if (e.p === '0') {
          if (e.e === 'Produce') {
            if (t1.includes(e.d) || e.d.includes('mouse')) {
              p1 += 20;
            } else if (t3.includes(e.d)) {
              p1 += 180;
            } else {
              p1 += 60;
            }
          }

          if (e.e === 'Die') {
            if (t1.includes(e.d) || e.d.includes('mouse')) {
              p1 -= 20;
            } else if (t3.includes(e.d)) {
              p1 -= 180;
            } else {
              p1 -= 60;
            }
          }
        } else {
          if (e.e === 'Produce') {
            if (t1.includes(e.d) || e.d.includes('mouse')) {
              p2 += 20;
            } else if (t3.includes(e.d)) {
              p2 += 180;
            } else {
              p2 += 60;
            }
          }

          if (e.e === 'Die') {
            if (t1.includes(e.d) || e.d.includes('mouse')) {
              p2 -= 20;
            } else if (t3.includes(e.d)) {
              p2 -= 180;
            } else {
              p2 -= 60;
            }
          }
        }

        return {
          id: e.p,
          x: parseInt(e.t),
          y: (e.p === '0') ? p1 : p2,
        };
      });

      this.players.forEach((p) => {
        switch (p.FactionId.txt) {
          case '0':
            colors.push('#D21E1E');
            break;
          case '1':
            colors.push('#148CFA');
            break;
          case '2':
            colors.push('#FFDC00');
            break;
          case '3':
            colors.push('#2ECC40');
            break;
          default:
            break;
        }
      });

      const g0 = gData.filter(data => data.id === '1');
      g0.unshift({ x: 0, y: 0 });

      const g1 = gData.filter(data => data.id === '0');
      g1.unshift({ x: 0, y: 0 });

      this.graphData = {
        labels: ['January', 'February'],
        datasets: [{
          label: 'Army Value',
          fill: false,
          radius: 0,
          backgroundColor: colors[0],
          borderColor: colors[0],
          borderWidth: 2,
          data: g0,
          showLine: true,
          steppedLine: true,
        },
        {
          label: 'Army Value 2',
          fill: false,
          radius: 0,
          backgroundColor: colors[1],
          borderColor: colors[1],
          borderWidth: 2,
          data: g1,
          showLine: true,
          steppedLine: true,
        }],

      };
    },
  },
};
</script>

<style lang="scss">
main {
  height: 100%;
}

.brand {
  position: fixed;
  bottom: 10px;
  right: 20px;
  text-align: right;

  img { 
    margin-right: 10px;
    max-width: 48px;
    vertical-align: middle;
  }
}

.graph {
  background: rgba(0,0,0,0.5);
  height: 33vh;
  position: relative;

  .chart { height: 100%; }
}

.rdata {
  height: 67vh;
  padding: 20px;
}

.milestones {
  float: right;
  position: relative;
  transform: translateY(-16px);
  width: calc(100% - 44px);

  .pog {
    background: black;
    border-radius: 100%;
    box-shadow: 0 0 0 3px white;
    display: inline-block;
    line-height: 32px;
    position: absolute;
    top: 0;
    transform: translateX(-24px);
    width: 32px;

    &[data-type="firstKill"]:before { content: "🗡"; }
    &[data-type="expand"]:before { content: "🏠"; }
    &[data-type="t3Kill"]:before { content: "☠"; }
    &[data-type="t2Build"]:before { 
      background: url(../assets/icons/t2.png) no-repeat center center;
      background-size: 100% auto;
      content: '';
      display: block;
      height: 32px;
      width: 32px;
    }
    &[data-type="t3Build"]:before { 
      background: url(../assets/icons/t3.png) no-repeat center center;
      background-size: 100% auto;
      content: '';
      display: block;
      height: 32px;
      width: 32px;
    }

    &[data-faction="0"] { box-shadow: 0 0 0 3px #D21E1E; }
    &[data-faction="1"] { box-shadow: 0 0 0 3px #148CFA; }
    &[data-faction="2"] { box-shadow: 0 0 0 3px #FFDC00; }
    &[data-faction="3"] { box-shadow: 0 0 0 3px #2ECC40; }

    /*
    &:after {
      background: white;
      content: '';
      height: 33vh;
      position: absolute;
      left: 50%; bottom: 32px;
      width: 1px;
      z-index: -1;
    }
    */
  }
}

.dzone {
  align-items: center;
  background: rgba(0,0,0,0.5);
  border: 3px dashed white;
  display: flex;
  height: 50vh;
  justify-content: center;
  position: absolute;
  top: 25vh; left: 10vw;
  width: 80vw;

  .replay + & {
    height: 64px;
    left: 20px;
    width: 200px;
    top: auto;
    bottom: 20px;
  }
}
</style>
