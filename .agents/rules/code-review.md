---
trigger: always_on
---

# Two-Axis Code Review Rules

Code changes should be reviewed along two independent axes:

1. **Standards Axis**:
   - Conformance to repository standards and Fowler code smells baseline (Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest).
   - Documented repo rules always override baseline heuristics.
2. **Spec Axis**:
   - Faithful implementation of originating requirements.
   - Zero tolerance for unrequested scope creep.
   - Verification of edge cases and correctness.
3. **Independent Evaluation**:
   - Code that is clean but implements the wrong thing fails the Spec axis.
   - Code that implements the right thing but violates standards fails the Standards axis.
   - Review both axes independently to prevent one from masking the other.
