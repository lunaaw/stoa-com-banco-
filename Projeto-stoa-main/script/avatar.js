const state = {
      skinColor: 'f8d25c',
      top: 'shortFlat',
      hairColor: '2c1b18',
      eyes: 'default',
      mouth: 'smile',
      facialHair: 'none',
      accessories: 'none',
      bgColor: 'b6e3f4'
    };

    function renderAvatar() {
      let url = `https://api.dicebear.com/9.x/avataaars/svg?top=${state.top}&hairColor=${state.hairColor}&eyes=${state.eyes}&mouth=${state.mouth}&skinColor=${state.skinColor}&backgroundColor=${state.bgColor}&radius=50`;

      if (state.facialHair !== 'none') {
        url += `&facialHair=${state.facialHair}&facialHairColor=${state.hairColor}&facialHairProbability=100`;
      } else {
        url += `&facialHairProbability=0`;
      }

      if (state.accessories !== 'none') {
        url += `&accessories=${state.accessories}&accessoriesProbability=100`;
      } else {
        url += `&accessoriesProbability=0`;
      }

      document.getElementById('avatarImg').src = url;
    }

    function setupOptionGroup(gridId, stateProperty) {
      const container = document.getElementById(gridId);
      const buttons = container.querySelectorAll('button');

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          buttons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          state[stateProperty] = button.getAttribute('data-val');
          renderAvatar();
        });
      });
    }

    function saveAvatar() {
      const avatarUrl = document.getElementById('avatarImg').src;
      alert('Avatar salvo com sucesso!');
      // Integração futura: enviar avatarUrl para o banco de dados/Supabase
    }

    window.onload = () => {
      setupOptionGroup('skinColorGrid', 'skinColor');
      setupOptionGroup('topGrid', 'top');
      setupOptionGroup('hairColorGrid', 'hairColor');
      setupOptionGroup('eyesGrid', 'eyes');
      setupOptionGroup('mouthGrid', 'mouth');
      setupOptionGroup('facialHairGrid', 'facialHair');
      setupOptionGroup('accessoriesGrid', 'accessories');
      setupOptionGroup('bgColorGrid', 'bgColor');

      renderAvatar();
    };