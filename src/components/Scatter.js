import { Scatter, mixins } from 'vue-chartjs';

const { reactiveProp } = mixins;

export default {
  extends: Scatter,
  mixins: [reactiveProp],
  mounted() {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          ticks: {
            stepSize: 9,
            autoSkip: false,
            callback(value) {
              if (value % 900 !== 0) return null;
              const date = new Date(null);
              date.setSeconds(Math.ceil(value / 30));
              return date.toISOString().substr(14, 5).replace(/^0+/, '');
            },
          },
        }],
      },
    });
  },
};
