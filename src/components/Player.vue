<template>
  <section class="player" :data-faction="faction">
    <div class="portrait">
      <h2>{{isWinner}}{{Identity.attr.Name}}</h2>
      <img :src="factionImg(FactionId.txt)" :alt=FactionId.txt>
    </div>

    <div class="deck">
      <pog v-for="u in deck" :key="u" :unit="u"></pog>
    </div>

    <h3 :title="opening.id">Opening: {{opening.label}}</h3>

    <ul class="actions">
        <li v-for="e in eConstruct" :key="e.t" :data-type="e.e">
          <strong>{{timeStamp(e.t)}}:</strong><span>{{structName(e.d)}}</span><pog :key="u" :unit="structName(e.d)"></pog>
        </li>
    </ul>
  </section>
</template>

<script>
import Pog from './Pog';

export default {
  name: 'Player',
  components: {
    pog: Pog,
  },
  props: ['player', 'gevents'],
  data() {
    return { ...this.player };
  },
  methods: {
    timeStamp(t) {
      const date = new Date(null);
      date.setSeconds(Math.ceil(t / 30));
      return date.toISOString().substr(14, 5);
    },
    factionImg(fid) {
      const images = require.context('../assets/comms/', false, /\.jpg$/);

      switch (fid) {
        case '0':
          return images('./Hopper.jpg');
        case '1':
          return images('./Bellafide.jpg');
        case '2':
          return images('./Archimedes.jpg');
        case '3':
          return images('./Quartermaster.jpg');
        default:
          return false;
      }
    },
    structName(s) {
      return s.replace('warren_', '').replace('structure_', '');
    },
  },
  computed: {
    faction() {
      const fid = this.FactionId.txt;

      switch (fid) {
        case '0':
          return 'Hopper';
        case '1':
          return 'Bellafide';
        case '2':
          return 'Archimedes';
        case '3':
          return 'Quartermaster';
        default:
          return false;
      }
    },
    deck() {
      return this.Deck.Cards.Card.map(u => u.attr.Data.replace('warren_', '').replace('structure_', ''));
    },
    isWinner() {
      return (this.Winner === this.ArmyIndex.txt) ? '☆ ' : null;
    },
    eProd() { return this.pevents.filter(e => e.e === 'Produce' && (e.d !== 'pig' && !e.d.includes('farm'))); },
    eSold() { return this.pevents.filter(e => e.e === 'Sell'); },
    eDie() { return this.pevents.filter(e => e.e === 'Die' && e.d !== 'pig' && !e.d.match(/warren|command|struct|farm|grist/gi)); },
    eBuilt() { return this.pevents.filter(e => e.e === 'Build'); },
    eConstruct() { return this.pevents.filter(e => e.e === 'Build' || e.e === 'Sell'); },
    opening() {
      const eList = (this.eConstruct.length < 5) ? this.eConstruct : this.eConstruct.slice(0, 5);
      const initialTen = eList.map(
          b => b.e.replace('Build', '')
                  .replace('Sell', '$') + b.d
                  .replace('structure_farm', 'F')
                  .replace('structure_campfire', 'C')
                  .replace('structure_gristmill', 'G')
                  .replace('warren_', 'W')
                  .replace('structure_', '')
                  .replace('machinegun', 'MGN')
                  .replace('barbedwire', 'BW')
                  .replace('landmine', 'MINE')
                  .replace('squirrel', 'SQ')
                  .replace('lizard', 'LZ')
                  .replace('Wmole', 'MOLE'),
      ).join('');

      // console.log(eList, initialTen);

      const open = { label: '', id: initialTen.substr(0, 11) };

      if (open.id.startsWith('W')) open.label = 'Rusher\'s Gambit'; // Turret, Warren
      if (open.id.startsWith('C')) open.label = 'The Camper'; // Turret, Warren
      if (open.id.startsWith('F')) open.label = 'Five Farm Something'; // Farm -> Anything
      if (open.id.startsWith('FW')) open.label = 'Zeno\'s Defense'; // 5 Farm, Warren
      if (open.id.startsWith('FFW')) open.label = 'Defender\'s Gambit'; // 6 Farm, Warren
      if (open.id.startsWith('FFFW')) open.label = 'Macro Gambit'; // 7 Farm, Warren
      if (open.id.startsWith('FFFF')) open.label = 'Greedy Gambit'; // 8 Farm
      if (open.id.startsWith('FMGN')) open.label = 'Badger\'s Gambit'; // 5 Farm, Turret
      if (open.id.startsWith('GMGN')) open.label = 'Masta Contain'; // Mill, Turret
      if (open.id.startsWith('WLZ')) open.label = 'Lizard Rush'; // 4 Farm, Lizard
      if (open.id.startsWith('F$FWLZ')) open.label = 'Faker\'s Lizard Rush'; // 5 Farm fake to Lizard
      if (open.id.startsWith('F$FWLZWLZ')) open.label = 'Faker\'s Heavy Lizard Rush'; // 5 Farm fake to 2+ Lizards
      if (open.id.startsWith('WSQ')) open.label = 'Squirrel Rush'; // 4 Farm, Squirrel
      if (open.id.startsWith('MOLE')) open.label = 'Mole Rush'; // 4 Farm, Mole
      if (open.id.startsWith('F$FMOLE')) open.label = 'Faker\'s Mole Rush'; // 5 Farm fake to Mole
      if (open.id.startsWith('F$FMOLEMOL')) open.label = 'Faker\'s Heavy Mole Rush'; // 5 Farm fake to 2+ Moles
      if (open.id.startsWith('FMOLE')) open.label = 'DJ\'s Mole'; // 5 Farm, Mole
      if (open.id.startsWith('MGNW')) open.label = 'Angry Turtle'; // Turret, Warren
      if (open.id.startsWith('GW')) open.label = 'Expander\'s Folly'; // Mill, Warren
      if (open.label === '') open.label = open.id;

      return open;
    },
    pevents() {
      return this.gevents.filter(e => e.p === this.ArmyIndex.txt);
    },
  },
};
</script>

<style lang="scss">
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.player {
    animation: fadeUp 1s ease;
    display: inline-block;
    margin: 0 10px;
    min-width: 352px;
    padding: 0 20px;
    position: relative;
    width: 22%;
    vertical-align: top;

    &:nth-child(2) {
      animation: fadeUp 2s ease;
    }

    .portrait {
      background: url('../assets/portrait_block.png') no-repeat center top;
      background-size: 100% auto;
      height: 345px;
      margin: 0;
      max-width: 376px;
      padding: 15% 6% 4%;
      position: relative;
      width: 100%;

      h2 {
        position: absolute;
        top: 0; left: 0;
        width: 100%;
      }

      img {
        dispaly: block;
        width: 100%;
      }
    }

    &[data-faction="Hopper"] h2 { color: #D21E1E; }
    &[data-faction="Bellafide"] h2 { color: #148CFA; }
    &[data-faction="Archimedes"] h2 { color: #FFDC00; }
    &[data-faction="Quartermaster"] h2 { color: #2ECC40; }

    .deck {
      position: absolute;
      top: 270px; left: 0;
      width: 100%;

      .pog { 
        filter: drop-shadow(0 0 10px black);
        max-width: 48px; 
      }
    }

    .actions {
      list-style: none;
      margin: 0;
      max-height: 160px;
      overflow: auto;
      padding: 0;
      text-align: left;
      vertical-align: top;

      li {
        align-items: center;
        background: rgba(0,0,0,0.5);
        display: flex;
        margin-bottom: 2px;
        padding: 5px 10px;
        text-transform: capitalize;

        span { flex-grow: 1; }
        img { max-width: 32px; }
      }
    }
}
</style>

