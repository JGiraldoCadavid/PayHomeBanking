const { createApp } = Vue;
createApp({
  data() {
    return {
      cardNumber: "",
      cardHolder: "",
      cvc: "",
      expiration: "",
      amount: 0,
      description: "",
      clients: "",
    };
  },
  created() {
    this.loadClients();
  },
  methods: {
    loadClients() {
      axios("http://localhost:8081/api/clients")
        .then((response) => {
          this.clients = response.data;
        })
        .catch((err) => console.log(err));
    },
    payWithCard() {
      if (!this.validateForm()) {
        return;
      }
      let infoPay = {
        numberCard: this.cardNumber,
        cvc: this.cvc,
        amount: this.amount,
        description: this.description,
        cardHolder: this.cardHolder,
        expiration: this.expiration,
      };
      axios
        .post("http://localhost:8081/api/cards/pay", infoPay)
        .then(async () => {
          await Swal.fire({
            position: "center",
            icon: "success",
            title: "the payment was made successfully",
            showConfirmButton: true,
          });
          location.reload();
        })
        .catch((err) => {
          console.log(err);
          const errorMessage =
            err.response && err.response.data
              ? err.response.data
              : "An error occurred with your payment method. Please try again.";
          Swal.fire({
            position: "center",
            icon: "error",
            title: errorMessage,
            showConfirmButton: true,
          });
        })
        .finally(() => {
          this.cardNumber = "";
          this.cvc = "";
          this.amount = 0.0;
          this.description = "";
        });
    },
    validateForm() {
      return (
        this.validateCardHolder() &&
        this.validateCardNumber() &&
        this.validateExpiration() &&
        this.validateCVC() &&
        this.validateAmount() &&
        this.validateDescription()
      );
    },
    validateCardNumber() {
      const numericCardNumber = this.cardNumber.replace(/[-\s]/g, "");
      if (!/^\d+$/.test(numericCardNumber)) {
        this.showError("Card number should only contain numbers.");
        return false;
      }
      if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(this.cardNumber)) {
        this.showError(
          "Invalid card number format. Please use the format 1234-5678-9012-3456."
        );
        return false;
      }
      return true;
    },
    handleCVCInput() {
      this.cvc = this.cvc.replace(/\D/g, "");

      this.cvc = this.cvc.slice(0, 3);
    },
    validateCVC() {
      if (!/^\d{3}$/.test(this.cvc)) {
        this.showError("CVC must be a 3-digit number");
        return false;
      }
      return true;
    },
    validateAmount() {
      if (this.amount <= 0) {
        this.showError("Enter a value greater than zero");
        return false;
      }
      return true;
    },
    validateDescription() {
      if (this.description.trim() === "") {
        this.showError("Missing description");
        return false;
      }
      return true;
    },
    showError(message) {
      Swal.fire({
        position: "center",
        icon: "error",
        title: message,
        showConfirmButton: true,
      });
    },
    formatCardNumber() {
      this.cardNumber = this.cardNumber.replace(/[^0-9]/g, "");
      this.cardNumber = this.cardNumber.slice(0, 16);
      const formattedCardNumber =
        this.cardNumber.match(/.{1,4}/g)?.join("-") || "";
      this.cardNumber = formattedCardNumber;
    },
    validateCardHolder() {
      if (this.cardHolder.trim() === "") {
        this.showError("Missing cardholder name");
        return false;
      }
      return true;
    },
    validateExpiration() {
      if (this.expiration.trim() === "") {
        this.showError("Missing expiration date");
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(this.expiration)) {
        this.showError(
          "Invalid expiration date format. Please use the format MM/YY"
        );
        return false;
      }
      return true;
    },
    formatExpiration() {
      this.expiration = this.expiration.replace(/[^0-9]/g, "");
      if (this.expiration.length > 2) {
        const firstTwo = this.expiration.substring(0, 2);
        const month = parseInt(firstTwo, 10);
        if (month < 1 || month > 12) {
          this.expiration = "01";
        } else {
          const remainingDigits = this.expiration.substring(2, 4);
          this.expiration = `${firstTwo}/${remainingDigits}`;
        }
      }
    },
  },
}).mount("#app");