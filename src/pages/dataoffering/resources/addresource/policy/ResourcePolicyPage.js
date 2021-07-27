import dataUtils from "@/utils/dataUtils";
import PolicyLine from "@/components/policy/PolicyLine.vue";

export default {
    components: {
        PolicyLine
    },
    data() {
        return {
            policyType: null,
            readonly: false,
            valid: true,
            policyLines: []
        };
    },
    mounted: function () {
        this.$data.readonly = this.$parent.$parent.$parent.$parent.readonly;
        this.$data.policyLines.push(Date.now());
    },
    methods: {
        gotVisible() {
            this.$data.readonly = this.$parent.$parent.$parent.$parent.readonly;
        },
        loadResource(resource) {
            if (resource.contract === undefined) {
                this.$data.policyDisplayName = dataUtils.POLICY_PROVIDE_ACCESS;
            } else {
                this.setPolicy(resource.contract, resource.policyName, resource.policyDescription);
            }
        },
        setPolicy(contract, policyType, policyDescription) {
            if (policyType == "") {
                this.$refs[dataUtils.getPolicyNames()[0]].setPolicy(contract);
            } else {
                this.$data.policyDisplayName = dataUtils.getPolicyDisplayName(policyType);
                if (contract == "") {
                    this.$refs[this.$data.policyDisplayName].setPolicyByDescription(policyDescription);
                } else {
                    this.$refs[this.$data.policyDisplayName].setPolicy(contract);
                }
            }
        },
        getDescription() {
            return this.$refs[this.$data.policyDisplayName].description;
        },
        previousPage() {
            this.$emit('previousPage')
        },
        nextPage() {
            this.$emit('nextPage')
        },
        addPolicy() {
            this.$data.policyLines.push(Date.now());
        },
        removePolicy(name) {
            console.log(">>> REMOVE: ", name);
            let index = this.$data.policyLines.indexOf(name);
            if (index > -1) {
                this.$data.policyLines.splice(index, 1);
            }
        }
    }
};
